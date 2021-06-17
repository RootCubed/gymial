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

const NEXT_SEM_START = 1614553200000;
const nextSemOnline = false;

let times = timesPre73;
let shortTimes = shortTimesPre73;

const DAY = 24 * 60 * 60 * 1000;

let rawData, timetableData;

let IDType = "class";
let classID = 2559;
let currPeriod = 74;
let persData;

let currMensa = "KZO";

let wh = window.innerHeight;
document.documentElement.style.setProperty('--wh', `${wh}px`);

if (window.localStorage.getItem("api")) {
    try {
        let json = JSON.parse(window.localStorage.getItem("api"));
        Cookies.set("username",  json.username, {expires: 365});
        Cookies.set("apiToken",  json.token, {expires: 365});
    } catch (e) {}
}

if (window.localStorage.getItem("class")) {
    try {
        let json = JSON.parse(window.localStorage.getItem("class"));
        classID = json.id;
        $("#current-class").text(json.name);
    } catch (e) {}
}

let searches = [];
if (window.localStorage.getItem("search-history")) {
    try {
        searches = JSON.parse(window.localStorage.getItem("search-history"));
    } catch (e) {}
}

let currTime = getFirstDayOfWeek(new Date()).getTime();

let classList = [];

let weekOffset = 0;

let currentView = 0;
const VIEW_NAMES = ["Stundenplan", "Mein Account", "Mensaplan"];
let currClassName = "C6c";

$(document).ready(() => {
    $("#today").attr("data-content", weekOffset);

    // try to see if we are already logged in
    getPersData();

    // get mensa data
    loadMensa("KZO", false);

    // timetable entries
    $(document).on("click", ".timetable-entry:not(.empty):not(.timetable-time)", (el) => {
        let lessonIndex = $(el.currentTarget).attr("data").split(';');
        let lessons = timetableData[lessonIndex[0]][lessonIndex[1]].data;
        let htmlString = "";
        for (let lesson of lessons) {
            if (lesson.special) return;
            htmlString += `<a class="overlay-tab">${lesson.cName}</a>`
        }
        $("#overlay-lesson-tabs").show();
        $("#overlay-lesson-tabs").html(htmlString);
        $("#overlay-lesson-tabs").children().eq(0).addClass("active");
        setLessonData(lessons[0]);
        $("#margin-details").fadeIn();
        $(".overlay-tab").on("click", el => {
            let tg = el.target;
            let currActive = document.querySelector("#overlay-lesson-tabs .active");
            if (tg == currActive) return;
            $(currActive).removeClass("active");
            $(tg).addClass("active");
            let index = Array.from(tg.parentNode.children).indexOf(tg);
            setLessonData(lessons[index]);
        });
    });
    $("#week-back").on("click", () => {
        currTime -= DAY * 7;
        weekOffset--;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint"); // small hack for WebKit browsers
        loadClass(true);
    });
    $("#today").on("click", () => {
        currTime = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = 0;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        loadClass(true);
    });
    $("#week-forward").on("click", () => {
        currTime += DAY * 7;
        weekOffset++;
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        loadClass(true);
    });
    $("#forward-next-sem").on("click", () => {
        currTime = NEXT_SEM_START;
        let now = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = Math.floor((NEXT_SEM_START - now) / (DAY * 7));
        $("#today").attr("data-content", weekOffset).addClass("repaint").removeClass("repaint");
        loadClass(true);
    });
    $("#backward-next-sem").on("click", () => {
        $("#today").click();
    });
    $("#open-menu").on("click", () => {
        $("#mainWindow").toggleClass("toRight");
        $("#sidebar").toggleClass("visible");
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

    let myAccountClickCount = 0;

    // clicking on class name
    $("#current-class").on("click", () => {
        if (currentView == 1) {
            myAccountClickCount++;
        } else {
            myAccountClickCount = 0;
        }
        if (myAccountClickCount == 10) {
            myAccountClickCount = 0;
            document.body.classList.toggle("dark");
        }
        if (currentView != 0) return; // timetable
        if ($("#margin-details").is(":visible")) return;
        $("#overlay-lesson-tabs, #room-detail, #teacher-detail, #detail-view").html("");
        $("#overlay-lesson-tabs").hide();
        if (IDType == "class") {
            fetch(`/class-personal-details/${classID}`)
            .then(response => {
                if (response.status == 401) return 401;
                return response.json();
            }).then(res => {
                if (res == 401) {
                    $(".sidebar-link").eq(1).click();
                    return;
                };
                $("#margin-details").fadeIn();
                $("#detail-view").html("<h1 style='margin-bottom: 20px'>Klassenliste " + $("#current-class").text() + "</h1>");
                for (let student of res) {
                    $("#detail-view").append(
                        `<div class="student"><p class="studentName">${student.studentName}</p></div>`
                    );
                }
            });
        } else {
            $("#margin-details").fadeIn();
            if (IDType == "student") {
                fetch("/getName/" + parseInt(classID)).then(res => res.json()).then(personName => {
                    fetch(`/search-internal-kzoCH/${personName.firstname}/${personName.lastname}/_`).then(response => {
                        if (response.status == 401) {
                            return 401;
                        }
                        return response.json();
                    }).then(res => {
                        if (res == 401) {
                            $(".sidebar-link").eq(1).click();
                            return;
                        };
                        let personalStuff = "";
                        for (let i = 3; i < 6; i++) {
                            personalStuff += "<p>" + res[0][i] + "</p>";
                        }
                        $("#detail-view").html(
                            `<div class="student"><h1>${personName.firstname + " " + personName.lastname}</h1><br><div class="personalDetails">${personalStuff}</div></div>`
                        );
                    });
                });
            } else {
                $("#detail-view").html(
                    `<div class="student"><h1>${$("#current-class").text()}</h1><br><p>Lehrerinformationen werden bald hinzugefügt.</p></div>`
                );
            }
        }
    });

    // clicking on search result
    $(document).on("click", ".searchResult", el => {
        let name = el.target.innerText;
        $("#current-class").text(name);
        classID = el.target.getAttribute("data");
        switch(classID[0]) {
            case 'c':
                IDType = "class";
                if (!nextSemOnline || currTime < NEXT_SEM_START) {
                    window.localStorage.setItem("class", JSON.stringify({id: classID.substr(1), name: name}));
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
        searches.unshift({
            id: classID,
            name: name,
            auth: true
        });
        // get rid of duplicated entries, removing all but the first occurrence
        searches = searches.filter((v, i, a) => {
            return a.findIndex(t => (t.id === v.id && t.name === v.name)) === i;
        });
        searches = searches.slice(0, 7); // max 7 search results
        window.localStorage.setItem("search-history", JSON.stringify(searches));
        classID = parseInt(classID.substr(1));
        $("#classSelect").val("");
        loadClass(true);
    });

    // clicking away from search box
    $(document).on("click", "", el => {
        if (el.target.id != "classSelect") {
            hideSearchResults();
        }
    });

    // person click in lesson view
    $(document).on("click", ".person-link", el => {
        IDType = "student";
        classID = parseInt(el.target.getAttribute("data"));
        $("#current-class").text(el.target.innerText);
        loadClass(true);
        $("#margin-details").fadeOut();
    });

    $("#logout").on("click", ev => {
        $("#invalid-login").hide();
        $("#login-form").show();
        $("#accountinfo").hide();
        Cookies.remove("username");
        Cookies.remove("apiToken");
        window.localStorage.removeItem("api");
    });

    $("#persplan").on("click", ev => {
        classID = persData.PersonID;
        IDType = "student";
        currClassName = persData.Nachname + ", " + persData.Vorname;
        loadClass(true);
        $("#link-timetable").click();
    });

    // logging in
    $("#login-form").on("submit", ev => {
        $("#invalid-login").hide();
        $("#login-submit").hide();
        $("#button-spinner img").show();
        ev.preventDefault();
        $("#login-user").val($("#login-user").val());
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
            getPersData();
            init(); // resources will be different when logged in
            $("#link-timetable").click();
        });
        return false;
    });

    // sidebar link
    $(".sidebar-link").click(el => {
        $("#margin-details").hide();
        $("#panel-timetable").removeClass();
        $("#panel-timetable").addClass("canScroll");
        $("#current-class").addClass("noclick");
        switch(el.target.innerText) {
            case VIEW_NAMES[0]:
                $("#current-class").text(currClassName);
                $("#panel-timetable").addClass("scrollTimetable");
                $(".sidebar-link").removeClass("active");
                $("#link-timetable").addClass("active");
                $("#week-btns").removeClass("hide");
                $("#current-class").removeClass("noclick");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $("#current-class").text(VIEW_NAMES[1]);
                $("#panel-timetable").addClass("scrollLogin");
                $(".sidebar-link").removeClass("active");
                $("#link-account").addClass("active");
                $("#week-btns").addClass("hide");
                currentView = 1;
                break;
            case VIEW_NAMES[2]:
                $("#current-class").html(`${VIEW_NAMES[2]} <span id="toggle-mensa">${currMensa}</span>`);
                $("#toggle-mensa").on("click", () => {
                    if (currMensa == "KZO") {
                        currMensa = "Schellerstrasse";
                    } else {
                        currMensa = "KZO";
                    }
                    $("#toggle-mensa").text(currMensa);
                    loadMensa(currMensa, true);
                });
                $("#panel-timetable").addClass("scrollMensa");
                $(".sidebar-link").removeClass("active");
                $("#link-mensa").addClass("active");
                $("#week-btns").addClass("hide");
                currentView = 2;
                break;
        }
        $("#mainWindow").delay(500).removeClass("toRight");
        $("#sidebar").delay(500).removeClass("visible");
        setTimeout(() => $("#panel-timetable").removeClass("canScroll"), 500);
        return;
    });

    window.addEventListener("resize", resizeScreen);
    window.addEventListener("orientationchange", resizeScreen);

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
    $("#error-timetable").hide();
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
        if (IDType == "class") {
            let cInClassList = false;
            for (let c of classes) {
                if (c.classId == classID) {
                    cInClassList = true;
                    break;
                }
            }
            if (!cInClassList || (oldClassList[0] && classes[0].classId != oldClassList[0].classId)) {
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
        loadClass(false);
    });
}

let classLoadingController = new AbortController()
let classLoadingSignal = classLoadingController.signal;

function loadClass(startAtZero) {
    $("#error-timetable").hide();
    if (startAtZero) progress(10);
    classLoadingController.abort();
    classLoadingController = new AbortController()
    classLoadingSignal = classLoadingController.signal;
    $("#timetable tbody").html("");
    fetch(`/period-from-time/${currTime}`, {
        signal: classLoadingSignal
    })
    .then(r => r.json())
    .then(perID => {
        progress(30);
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
        fetch(`/timetable/${IDType}/${classID}/${currTime}`, {
            signal: classLoadingSignal
        }).then(response => {
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
            if (IDType == "student") {
                $("#current-class").text(idToName(classID) + " (" + classFromTTData(json).replace(/ /g, '') + ")");
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
                    if (timetableData[day][i].type == "ignore") {
                        continue;
                    }
                    let lessons = "";
                    let isSpecial = "";
                    if (timetableData[day][i].type == "lesson") {
                        for (let lesson of timetableData[day][i].data) {
                            let modText = "";
                            if (lesson.special) isSpecial = "special";
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
                    }
                    if (timetableData[day][i].type == "empty") {
                        $(".time-row").last().append(`<td rowspan=${timetableData[day][i].length} class="timetable-entry empty"><div class="sc_cont"></div></td>`);
                    } else {
                        let lLength = timetableData[day][i].length;
                        let lengthName = "";
                        if (lLength == 2) {
                            lengthName = "double";
                        }
                        if (lLength == 3) {
                            lengthName = "triple";
                        }
                        if (lLength == 11) {
                            lengthName = "fullday"
                        }
                        $(".time-row").last().append(`
                            <td rowspan=${lLength} class="timetable-entry ${isSpecial}" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>
                        `);
                    }
                }
            }
            applyScrolling();
            progress(100);
        })
        .catch(e => {
            if (e.name !== "AbortError") {
                console.error(`Error loading /timetable/${IDType}/${classID}/${currTime}`);
                displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
                "Sonst ist möglicherweise das TAM-Intranet offline, weshalb momentan keine Stundenpläne geladen werden können.");
            }
            progress(100);
        });
    })
    .catch(e => {
        if (e.name !== "AbortError") {
            console.error(`Error loading /period-from-time/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
            "Sonst ist möglicherweise das TAM-Intranet offline, weshalb momentan keine Stundenpläne geladen werden können.");
        }
        progress(100);
    });
}

function getPersData() {
    fetch("/myData").then(res => res.json()).then(res => {
        if (res.total > 0) {
            persData = res.data[0];
            $("#ownName").text(persData.Vorname + " " + persData.Nachname);
            $("#otherDetails").text(persData.Adresse + ", " + persData.PLZ + " " + persData.Ort);
            $("#login-form").hide();
            $("#accountinfo").show();
        }
    });
}

function loadMensa(name, showProgress) {
    if (showProgress) progress(50);
    fetch("/mensa/" + name).then(res => res.json()).then(res => {
        let tableHtml = "";
        for (let date in res) {
            tableHtml += `<tr><td style="width: 15%;"><span class="mensa-date">${date}</span></td>`;
            for (let menu of res[date]) {
                tableHtml += `<td><span class="mensa-desc"><span style="font-weight: bold">${menu.title}</span><br>${menu.description}<br></span></td>`;
            }
            tableHtml += "</tr>";
        }
        $("#mensa-table tbody").html(tableHtml);
        if (showProgress) progress(100);
    });
}

let lastEvTime;
let timeout = false;
let debounceDelay = 100;
function resizeScreen() {
    // still set the wh variable, but we don't re-apply the scrolling effect yet
    let wh = window.innerHeight;
    if (document.documentElement.style.getPropertyValue("--wh") != `${wh}px`) {
        document.documentElement.style.setProperty("--wh", `${wh}px`);
    }

    lastEvTime = Date.now();
    if (timeout == false) {
        timout = true;
        setTimeout(resizeEnd, debounceDelay);
    }
}

function resizeEnd() {
    if (Date.now() - lastEvTime < debounceDelay) {
        setTimeout(resizeEnd, debounceDelay);
    } else {
        timeout = false;
        applyScrolling();
    }
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
    if (!nextSemOnline) {
        $("#forward-next-sem").hide();
        $("#backward-next-sem").hide();
    } else {
        if (currTime >= NEXT_SEM_START) {
            $("#forward-next-sem").hide();
            $("#backward-next-sem").show();
        } else {
            $("#forward-next-sem").show();
            $("#backward-next-sem").hide();
        }
    }
}

function classFromTTData(data) {
    let potentialClasses = {};
    for (let d of data) {
        if (d.classId.length == 1) {
            if (potentialClasses[d.className]) {
                potentialClasses[d.className]++;
            } else {
                potentialClasses[d.className] = 1;
            }
        }
    }
    let best = ["", 0];
    for (let d in potentialClasses) {
        if (potentialClasses[d] > best[1]) {
            best[0] = d;
            best[1] = potentialClasses[d];
        }
    }
    return best[0];
}

function idToName(id) {
    for (let el of classList) {
        if (el.name) {
            if (el.personId == id) {
                return el.name;
            }
        }
    }
    return "";
}

function setLessonData(lesson) {
    $("#teacher-detail").text(lesson.tFull);
    $("#detail-view").html("<div id='names'></div>");
    if (lesson.cId) {
        fetch("/course-participants/" + lesson.cId).then(r => {
            if (r.status == 401) return 401;
            return r.json();
        }).then(res => {
            if (res == 401) {
                $(".sidebar-link").eq(1).click();
                return;
            }
            let html = "";
            for (let r of res) {
                html += `<span class="student studentName person-link" data="${r.id}">${r.name}</span>`
            }
            $("#detail-view div").html(html);
        });
    } else {
        $("#detail-view div").html("Keine Informationen über die Teilnehmer an diesem Kurs!");
    }
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
            cId: lesson.courseId,
            class: lesson.classId,
            tId: lesson.teacherId[0],
            tAcronym: lesson.teacherAcronym,
            tFull: lesson.teacherFullName,
            room: lesson.roomName,
            sNames: lesson.student,
            fullDay: lesson.isAllDay,
            special: lesson.timetableEntryTypeId == 15,
            cancelled: lesson.timetableEntryTypeId == 11
        };
        if (mLesson.cName == "IU") {
            if (!mLesson.sNames) continue;
            if (!mLesson.sNames[0]) continue;
            if (insPersonIds.indexOf(mLesson.sNames[0].studentId) > -1) continue;
            insPersonIds.push(mLesson.sNames[0].studentId);
        }
        minimalLessons.push(mLesson);
    }
    let minDate = getFirstDayOfWeek(new Date(currTime));
    for (let date = minDate; date < new Date(minDate.getTime() + DAY * 5); date = new Date(date.getTime() + DAY)) {
        result[date.toLocaleDateString("de-CH", {timeZone: "Europe/Zurich"})] = 
        new Array(times.length).fill(null).map(() => {
            return {
                type: "empty",
                length: 1,
                data: []
            };
        });
    }
    // second pass of data, put all lessons in array
    for (let i = 0; i < minimalLessons.length; i++) {
        let lesson = minimalLessons[i];

        if (!result[dateToObjectKey(lesson.lDate)]) continue;

        let tmpTime = lesson.lStart.split(':');
        let shortTime = parseInt(tmpTime[0] + tmpTime[1]);

        let index = 0;
        while (shortTimes[index + 1] <= shortTime) {
            index++;
        }

        result[dateToObjectKey(lesson.lDate)][index].type = "lesson";
        result[dateToObjectKey(lesson.lDate)][index].data.push(lesson);
    }
    // third pass of data, find double lessons
    for (let day in result) {
        let currRef = undefined;
        let lessonLength = 1;

        for (let i = 0; i <= result[day].length; i++) {
            if (currRef != 0 && !currRef) currRef = -1;

            let compLesson = result[day][currRef];
            let currLesson = result[day][i];

            if (currLesson && currLesson.data.length > 0 && currLesson.data[0].fullDay) {
                result[day][i].type = "lesson";
                result[day][i].length = 11;
                result[day][i].data = [result[day][i].data[0]]; // only use the full day info
                for (let i = 1; i < result[day].length; i++) {
                    result[day][i].type = "ignore";
                }
                break;
            }

            if (currLesson && compLesson && areLessonsIdentical(currLesson.data, compLesson.data)) {
                lessonLength++;
            } else {
                if (result[day][currRef] && result[day][currRef].length > 0) { // && result[day][currRef].type != "empty"
                    result[day][currRef].length = lessonLength;
                    for (let cLes = currRef + 1; cLes < currRef + lessonLength; cLes++) {
                        result[day][cLes].type = "ignore";
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
            (les1Entries.sNames && les2Entries.sNames && !arraysAreEqual(les1Entries.sNames, les2Entries.sNames))
        ) {
            return false;
        }
    }
    return true;
}

function arraysAreEqual(ar1, ar2) {
    if (ar1.length !== ar2.length) return false;
    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i].studentId !== ar2[i].studentId) return false;
    }
    return true;
}

function dateToObjectKey(date) {
    return new Date(parseInt(date.substr(6))).toLocaleDateString("de-CH", {timeZone: "Europe/Zurich"});
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
        for (let search of searches) {
            $("#search-results").append(`<span class="searchResult" data="${search.id}">${search.name}</span>`);
        }
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

function hideSearchResults() {
    $("#search-dropdown span").remove();
}

function displayError(title, message) {
    $("#error-title").text(title);
    $("#error-desc").text(message);
    $("#error-timetable").fadeIn(100);
}