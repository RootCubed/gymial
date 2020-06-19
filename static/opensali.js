const timesPre73 = [
    "07:30-08:15",
    "08:25-09:10",
    "09:20-10:05",
    "10:25-11:10",
    "11:20-12:05",
    "12:25-13:10",
    "13:20-14:05",
    "14:15-15:00",
    "15:10-15:55",
    "16:05-16:50",
    "16:55-17:40"
];
const shortTimesPre73 = [730, 825, 920, 1025, 1120, 1225, 1320, 1415, 1510, 1605, 1655];

const timesPost73 = [
    "07:30-08:15",
    "08:25-09:10",
    "09:30-10:15",
    "10:35-11:20",
    "11:40-12:25",
    "12:35-13:20",
    "13:40-14:25",
    "14:45-15:30",
    "15:40-16:25",
    "16:35-17:20",
    "17:20-18:05"
];
const shortTimesPost73 = [730, 825, 920, 1035, 1140, 1235, 1340, 1445, 1540, 1635, 1720];

const NEXT_SEM_START = 1597615200000;

let times = timesPre73;
let shortTimes = shortTimesPre73;

const DAY = 24 * 60 * 60 * 1000;

let rawData, timetableData;

let IDType = "class";
let classID = 2421;
let currPeriod = 72;

if (window.localStorage.getItem("api")) {
    try {
        let json = JSON.parse(window.localStorage.getItem("api"));
        Cookies.set("username",  json.username);
        Cookies.set("apiToken",  json.token);
    } catch (e) {}
}

if (window.localStorage.getItem("class")) {
    try {
        let json = JSON.parse(window.localStorage.getItem("class"));
        classID = json.id;
        $("#current-class").text(json.name);
    } catch (e) {}
}

let currTime = getFirstDayOfWeek(new Date()).getTime();

let classList = [];

let weekOffset = 0;

let currentView = 0;
const VIEW_NAMES = ["Stundenplan", "Mein Account"];
let currClassName = "C5c";

// You're a sneaky one... please don't use this function too much, as it makes a lot of requests to the server. Thanks!
async function getAllDetailsOfEveryone() {
    let finalData = [];
    let allClasses = await fetch(`/resources/72`);
    let aCJson = await allClasses.json();
    for (let cl of aCJson) {
        if (!cl.classId) break;
        let clList = await fetch(`/class-personal-details/${cl.classId}`);
        let cJson = await clList.json();
        finalData.push(...cJson.data);
    }
    console.log("Here you go ;) Use it responsibly.");
    console.log(finalData);
}

$(document).ready(() => {
    $("#today").attr("data-content", weekOffset);
    $(document).on("click", ".timetable-entry:not(.empty):not(.timetable-time)", (el) => {
        let lessonIndex = $(el.currentTarget).attr("data").split(';');
        let lessons = timetableData[lessonIndex[0]][lessonIndex[1]];
        let htmlString = "";
        for (let lesson of lessons) {
            htmlString += `<a class="overlay-tab">${lesson.cName}</a>`
        }
        $("#overlay-lesson-tabs").html(htmlString);
        $("#overlay-lesson-tabs").children().eq(0).addClass("active");
        setLessonData(lessons[0]);
        $("#margin-details").fadeIn();
        $(".overlay-tab").on("click", (el) => {
            let index = 0;
            let tg = el.target;
            $("#overlay-lesson-tabs").children().removeClass("active");
            $(tg).addClass("active");
            while (tg.previousSibling != null) {
                tg = tg.previousSibling;
                index++;
            }
            setLessonData(lessons[index]);
        });
    });
    $("#week-back").on("click", () => {
        currTime -= DAY * 7;
        weekOffset--;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint"); // small hack for WebKit browsers
        init();
    });
    $("#today").on("click", () => {
        currTime = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = 0;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        init();
    });
    $("#week-forward").on("click", () => {
        currTime += DAY * 7;
        weekOffset++;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        init();
    });
    $("#forward-next-sem").on("click", () => {
        currTime = NEXT_SEM_START;
        let now = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = Math.floor((NEXT_SEM_START - now) / (DAY * 7));
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        init();
    });
    $("#backward-next-sem").on("click", () => {
        $("#today").click();
    });
    $("#open-menu").on("click", () => {
        $("#mainWindow").toggleClass("toRight");
        $("#sidebar").toggleClass("visible");
    });
    $("#link-account").on("click", () => {
        $("#panel-account").fadeIn();
    });

    // swiping for side panel
    let swipeStartX = 0;
    let swipeStartY = 0;
    document.addEventListener("touchstart", event => {
        let t = event.touches[0];
        swipeStartX = t.screenX; 
        swipeStartY = t.screenY;
    });
    document.addEventListener("touchmove", event => {
        var t = event.touches[0];
        if (Math.abs(swipeStartY - t.screenY) < 20) {
            if (swipeStartX - t.screenX < -50) {
                $("#mainWindow").addClass("toRight");
                $("#sidebar").addClass("visible");
            } else if (swipeStartX - t.screenX > 50) {
                $("#mainWindow").removeClass("toRight");
                $("#sidebar").removeClass("visible");
            }
        }
    });
    $(document).on("mousedown", ".overlay-window", event => {
        if ($(event.target).is(".overlay-window")) {
            $(event.target).fadeOut();
        }
        if ($(event.target).is(".icon-x")) {
            $(event.target).parent().parent().fadeOut();
        }
    });

    // clicking on class name
    $("#current-class").on("click", () => {
        if ($("#margin-details").is(":visible")) return;
        if (IDType == "class") {
            fetch(`/class-personal-details/${classID}`)
            .then(response => {
                if (response.status == 401) {
                    return 401;
                }
                return response.json();
            }).then(res => {
                if (res == 401) {
                    $(".sidebar-link").eq(1).click();
                    return;
                };
                $("#overlay-lesson-tabs, #room-detail, #teacher-detail, #personal-shit").html("");
                $("#margin-details").fadeIn();
                for (let student of res) {
                    $("#personal-shit").append(
                        `<div class="student"><img id="sdPic${student.studentId}" src="spinner.svg"><p class="studentName">${student.studentName}</p></div>`
                    );
                    let img = new Image();
                    img.src = "/picture/" + student.studentId;
                    img.onload = () => {
                        $(`#sdPic${student.studentId}`).attr("src", "/picture/" + student.studentId);
                    };
                }
            });
        } else {
            $("#personal-shit").append(
                `<div class="student"><img id="sdPic${classID}" src="spinner.svg"><p class="studentName">${$("#current-class").text()}</p></div>`
            );
            let img = new Image();
            img.src = "/picture/" + classID;
            img.onload = () => {
                $(`#sdPic${classID}`).attr("src", "/picture/" + classID);
            };
            img.onerror = () => {
                $("#margin-details").fadeOut();
                $(".sidebar-link").eq(1).click();
            };
        }
    });

    // clicking on search result
    $(document).on("click", ".searchResult", el => {
        $("#current-class").text(el.target.innerText);
        classID = el.target.getAttribute("data");
        switch(classID[0]) {
            case 'c':
                IDType = "class";
                if (currTime < NEXT_SEM_START) {
                    window.localStorage.setItem("class", JSON.stringify({id: classID.substr(1), name: el.target.innerText}));
                }
                break;
            case 't':
                IDType = "teacher";
                break;
            case 's':
                IDType = "student";
                break;
            case 'r':
                IDType = "room";
                break;
        }
        classID = parseInt(classID.substr(1));
        $("#classSelect").val("");
        $("#search-dropdown span").remove();
        init();
    });

    // logging in
    $("#login-form").on("submit", ev => {
        $("#invalid-login").hide();
        $("#login-submit").hide();
        $("#button-spinner img").show();
        ev.preventDefault();
        $("#login-user").val($("#login-user").val().toLowerCase().replace(/\@studmail.kzo.ch/g, ""));
        fetch("/auth", {
            method: "post",
            body: `user=${$("#login-user").val()}&pass=${$("#login-pw").val()}`
        }).then(res => {
            if (res.status == 401) {
                // Unsuccessful authentication
                $("#invalid-login").show();
                $("#login-submit").show();
                $("#button-spinner img").hide();
                return;
            }
            return res.text();
        }).then(token => {
            if (!token) return;
            window.localStorage.setItem("api", JSON.stringify({username: $("#login-user").val(), token: token}));
            Cookies.set("username", $("#login-user").val(), {expires: 30, path: ""});
            Cookies.set("apiToken", token, {expires: 30, path: ""});
            $("#login-form").hide();
            $("#accountinfo").show();
            $("#ownName").text("Hallo, " + $("#login-user").val());
            init();
            $("#link-timetable").click();
        });
        return false;
    });

    // sidebar link
    $(".sidebar-link").click(el => {
        switch(el.target.innerText) {
            case VIEW_NAMES[0]:
                $("#current-class").text(currClassName);
                $("#timetable").removeClass();
                $("#timetable").addClass("scrollTimetable");
                $("#link-timetable").addClass("active");
                $("#link-account").removeClass("active");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $("#current-class").text("Mein Account");
                $("#timetable").removeClass();
                $("#timetable").addClass("scrollLogin");
                $("#link-timetable").removeClass("active");
                $("#link-account").addClass("active");
                currentView = 1;
                break;
        }
        $("#mainWindow").delay(500).removeClass("toRight");
        $("#sidebar").delay(500).removeClass("visible");
        return;
    });

    $(window).resize(applyScrolling);

    // web worker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register("service-worker.js").then(sw => {
            sw.addEventListener("updatefound", () => {
                let newWorker = sw.installing;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state == "installed") {
                        newWorker.postMessage({action: "skipWaiting"});
                    }
                });
            });
        });
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
        });
    }

    init();
});

function init() {
    progress(10);
    enableDisableSemButton();
    $("#timetable tbody").html("");
    fetch(`/resources/${currTime}`).then(response => {
        return response.json();
    }).then(classes => {
        progress(20);
        if (classes.offline) {
            $("#current-class").text("Offline");
            progress(0);
            return;
        }
        classes = classes.data;
        let oldClassList = classList;
        classList = classes;
        if (oldClassList[0]) {
            if (classes[0].classId != oldClassList[0].classId) {
                if (window.localStorage.getItem("class")) {
                    try {
                        let json = JSON.parse(window.localStorage.getItem("class"));
                        if (classID == json.id) throw "localStorage is from this semester";
                        classID = json.id;
                        $("#current-class").text(json.name);
                    } catch (e) {
                        classID = classes[0].classId;
                        IDType = "class";
                        currClassName = classes[0].className.replace(' ', '');
                        $("#current-class").text(currClassName);
                    }
                } else {
                    classID = classes[0].classId;
                    IDType = "class";
                    currClassName = classes[0].className.replace(' ', '');
                    $("#current-class").text(currClassName);
                }
            }
        }
        loadClass();
    });
}

function loadClass() {
    progress(40);
    fetch(`/period-from-time/${currTime}`)
    .then(r => r.json())
    .then(perID => {
        if (parseInt(perID) >= 73) {
            times = timesPost73;
            shortTimes = shortTimesPost73;
        } else {
            times = timesPre73;
            shortTimes = shortTimesPre73;
        }
        if (parseInt(perID) != currPeriod) {
            currPeriod = parseInt(perID);
            init();
            return;
        }
        fetch(`/timetable/${IDType}/${classID}/${currTime}`).then(response => {
            progress(50);
            return response.json();
        }).then(json => {
            if (IDType == "class") {
                for (let i = 0; i < classList.length; i++) {
                    if (!classList[i].classId) break;
                    if (classList[i].classId == classID) {
                        currClassName = classList[i].className.replace(' ', '');
                        $("#current-class").text(currClassName);
                    }
                }
            }
            let mainDiv = $("#timetable tbody");
            mainDiv.html("");
            progress(60);
            rawData = json;
            timetableData = convertToUsable(json);
            let dates = "";
            for (let day in timetableData) {
                dates += `<th class="timetable-date">${day}</th>`;
            }
            mainDiv.append(`<tr><td class="timetable-time"></td>${dates}</tr>`);
            for (let i = 0; i < times.length; i++) {
                let timeRows = times[i];
                mainDiv.append(
                    `<tr class="time-row"><td class="timetable-entry timetable-time timetable-lesson-times">${timeRows}</td></tr>`
                );
                for (let day in timetableData) {
                    let lessons = "";
                    for (let lesson of timetableData[day][i]) {
                        let modText = "";
                        if (lesson.special) modText = "special";
                        if (lesson.cancelled) modText = "cancelled";
                        lessons += `<div class="${modText}"><span class="entry-title">${lesson.cName}</span>`;
                        if (lesson.room != "") {
                            lessons += `<span class="entry-room">${lesson.room}</span>`;
                        }
                        if (lesson.tAcronym != "") {
                            lessons += `<span class="entry-teacher">${lesson.tAcronym}</span>`;
                        }
                        if (lesson.sNames != undefined && lesson.sNames.length > 0) {
                            lessons += (lesson.cName == "IU") ? `<br><span class="entry-instrName">${lesson.sNames[0].studentName}</span>` : "";
                        }
                        lessons += "</div>";
                    }
                    if (!timetableData[day][i][0]) {
                        $(".time-row").last().append(`<td class="timetable-entry empty"><div class="sc_cont"></div></td>`);
                    } else {
                        let stLength = timetableData[day][i][0].lessonLength;
                        for (let j = 0; j < timetableData[day][i].length; j++) {
                            if (timetableData[day][i][j].lessonLength != stLength) {
                                ignoreDouble = true;
                                break;
                            }
                        }
                        if (timetableData[day][i][0].hideForMultiple) {
                            continue;
                        }
                        let lLength = timetableData[day][i][0].lessonLength;
                        let lengthName = "";
                        if (lLength == 2) {
                            lengthName = "double";
                        }
                        if (lLength == 3) {
                            lengthName = "triple";
                        }
                        $(".time-row").last().append(`
                            <td rowspan=${lLength} class="timetable-entry" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>
                        `);
                    }
                }
            }
            applyScrolling();
            progress(100);
        });
    });
}

function applyScrolling() {
    $(".time-row .scroller").each(function(index) {
        let scrollerEl = $(this);
        scrollerEl.removeClass("scrolling");
        scrollerEl.children().last().html("");
        if (scrollerEl.height() > scrollerEl.parent().height()) {
            scrollerEl.addClass("scrolling");
            scrollerEl.children().last().html(scrollerEl.html());
        }
    });
}

function enableDisableSemButton() {
    if (currTime >= NEXT_SEM_START) {
        $("#forward-next-sem").hide();
        $("#backward-next-sem").show();
    } else {
        $("#forward-next-sem").show();
        $("#backward-next-sem").hide();
    }
}

function setLessonData(lesson) {
    $("#teacher-detail").text(lesson.tFull);
    $("#personal-shit").html("<img>");
    $("#personal-shit img").attr("src", "spinner.svg");
    let img = new Image();
    img.src = "/picture/" + lesson.tId;
    img.onload = () => {
        $("#personal-shit img").addClass("teacher").attr("src", "/picture/" + lesson.tId);
    }
    img.onerror = () => {
        $("#margin-details").hide();
        $(".sidebar-link").eq(1).click();
    };
}

function convertToUsable(timetable) {
    let result = {};
    // first pass of data, remove completely unnecessary stuff and find range of dates
    let minimalLessons = [];
    let insPersonIds = [];
    for (let lesson of timetable) {
        let mLesson = {
            lDate: lesson.start,
            lStart: lesson.lessonStart,
            lEnd: lesson.lessonEnd,
            cName: lesson.title,
            class: lesson.classId,
            tId: lesson.teacherId[0],
            tAcronym: lesson.teacherAcronym,
            tFull: lesson.teacherFullName,
            room: lesson.roomName,
            sNames: lesson.student,
            lessonLength: 1,
            hideForMultiple: false,
            fullDay: lesson.isAllDay,
            special: lesson.timetableEntryTypeId == 15,
            cancelled: lesson.timetableEntryTypeId == 11
        };
        if (mLesson.cName == "IU") {
            if (!mLesson.sNames) continue;
            if (insPersonIds.indexOf(mLesson.sNames[0].studentId) > -1) continue;
            insPersonIds.push(mLesson.sNames[0].studentId);
        }
        minimalLessons.push(mLesson);
    }
    let minDate = getFirstDayOfWeek(new Date(parseInt(minimalLessons[0].lDate.substr(6))));
    for (let date = minDate; date < new Date(minDate.getTime() + DAY * 5); date = new Date(date.getTime() + DAY)) {
        result[date.toLocaleDateString("de-CH")] = new Array(times.length).fill(null).map(() => []);
    }
    // second pass of data, put all lessons in array
    for (let i = 0; i < minimalLessons.length; i++) {
        let lesson = minimalLessons[i];
        let tmpTime = lesson.lStart.split(':');
        let shortTime = parseInt(tmpTime[0] + tmpTime[1]);

        let index = 0;
        while (shortTimes[index + 1] <= shortTime) {
            index++;
        }

        result[dateToObjectKey(lesson.lDate)][index].push(lesson);
    }
    // third pass of data, find double lessons
    for (let day in result) {
        let currRef = undefined;
        let lessonLength = 1;

        for (let i = 0; i <= result[day].length; i++) {
            if (currRef != 0 && !currRef) currRef = -1;

            let compLesson = result[day][currRef];
            let currLesson = result[day][i];

            if (areLessonsIdentical(currLesson, compLesson)) {
                lessonLength++;
            } else {
                if (result[day][currRef] && result[day][currRef].length > 0) {
                    result[day][currRef][0].lessonLength = lessonLength;
                    for (let cLes = currRef + 1; cLes < currRef + lessonLength; cLes++) {
                        result[day][cLes][0].hideForMultiple = true;
                    }
                }
                currRef = i;
                lessonLength = 1;
            }
        }
    }
    return result;
}

function areLessonsIdentical(les1, les2) {
    if (!les1 || !les2) return false;
    if (les1.length != les2.length) return false;
    for (let j = 0; j < les1.length; j++) {
        let les1Entries = les1[j];
        let les2Entries = les2[j];
        if (
            les1Entries.cName != les2Entries.cName ||
            les1Entries.tAcronym != les2Entries.tAcronym ||
            (les1Entries.sNames && les2Entries.sNames && les1Entries.sNames.length != les2Entries.sNames.length)
        ) {
            return false;
        }
    }
    return true;
}

function dateToObjectKey(date) {
    return new Date(parseInt(date.substr(6))).toLocaleDateString("de-CH");
}

function getFirstDayOfWeek(d) {
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function progress(number) {
    $("#progress-bar").css("width", number + "%");
    if (number === 100) {
        setTimeout (() => {
            $("#progress-bar").css("background-color", "white");
        }, 500);
        setTimeout (() => {
            $("#progress-bar").css("width", "0%");
        }, 1000);
        setTimeout (() => {
            $("#progress-bar").css("background-color", "#329F5B");
        }, 1500);
    }
}

function filterObjects() {
    let input = $("#classSelect").val().toLowerCase().replace(' ', '');
    $("#search-results span").remove();
    if (input.length < 1) {
        return;
    }
    let t = classList.filter(val => {
        if (val.className) {
            return val.className.toLowerCase().replace(' ', '').includes(input);
        } else if (val.room) {
            return val.room.toLowerCase().includes(input);
        } else {
            return val.name.toLowerCase().includes(input);
        }
    });
    for (let found of t) {
        if (found.classId) {
            $("#search-results").append(`<span class="searchResult" data="c${found.classId}">${found.className.replace(' ', '')}</span>`);
        } else if (found.acronym) {
            $("#search-results").append(`<span class="searchResult" data="t${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`);
        } else if (found.room) {
            $("#search-results").append(`<span class="searchResult" data="r${found.roomId}">${found.room}</span>`);
        } else {
            $("#search-results").append(`<span class="searchResult" data="s${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`);
        }
    }
}