const times = [
    "07:30-08:15",
    "08:25-09:10",
    "09:20-10:05",
    "10:25-11:10",
    "11:10-12:05",
    "12:25-13:10",
    "13:20-14:05",
    "14:15-15:00",
    "15:10-15:55",
    "16:05-16:50",
    "16:55-17:40"
]
const shortTimes = [730, 825, 920, 1025, 1110, 1225, 1320, 1415, 1510, 1605, 1655];

const DAY = 24 * 60 * 60 * 1000;

const FULL_LESSON = 1;
const DOUBLE_LESSON = 2;
const TRIPLE_LESSON = 3;

let rawData, timetableData;

let IDType = "class";
let classID = 2359;

let currTime = getFirstDayOfWeek(new Date()).getTime();

let classList = [];

let weekOffset = 0;

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
    $("#week-back").click(() => {
        currTime -= DAY * 7;
        weekOffset--;
        $("#today").attr("data-content", weekOffset);
        loadClass();
    });
    $("#today").click(() => {
        currTime = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = 0;
        $("#today").attr("data-content", weekOffset);
        loadClass();
    });
    $("#week-forward").click(() => {
        currTime += DAY * 7;
        weekOffset++;
        $("#today").attr("data-content", weekOffset);
        loadClass();
    });
    $("#open-menu").click(() => {
        $("#mainWindow").toggleClass("toRight");
        $("#sidebar").toggleClass("visible");
    });
    let swipeStartX = 0;
    let swipeStartY = 0;
    document.addEventListener("touchstart", event => {
        var t = event.touches[0];
        swipeStartX = t.screenX; 
        swipeStartY = t.screenY;
    });
    document.addEventListener("touchmove", event => {
        var t = event.touches[0];
        console.log(t);
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
    $(document).on("click", "#margin-details", event => {
        if ($(event.target).is("#margin-details, .icon-x")) {
            $("#margin-details").fadeOut();
        }
    });
    $("#current-class").on("click", () => {
        $("#overlay-lesson-tabs, #room-detail, #teacher-detail, #personal-shit").html("");
        $("#margin-details").fadeIn();
        let index = 0;
        while (rawData[index].classId.length != 1 || rawData[index].classId[0] != classID) {
            index++;
        }
        fetch(`/getClassNumPeople/${rawData[index].className}`)
        .then(response => response.text())
        .then(res => {
            let clList = [];
            for (let c of rawData) {
                if (c.student.length == res) {
                    clList = c.student;
                }
            }
            for (let student of clList) {
                let img = new Image();
                img.src = "/getPicture/" + student.studentId;
                img.onload = () => {
                    $(`#sdPic${student.studentId}`).attr("src", "/getPicture/" + student.studentId);
                }
                $("#personal-shit").append(
                    `<div class="student"><img id="sdPic${student.studentId}" src="spinner.svg"><p class="studentName">${student.studentName}</p></div>`
                );
            }
        })
    });
    $(document).on("click", ".searchResult", el => {
        $("#current-class").text(el.target.innerText);
        classID = el.target.getAttribute("data");
        switch(classID[0]) {
            case 'c':
                IDType = "class";
                break;
            case 't':
                IDType = "teacher";
                break;
        }
        classID = classID.substr(1);
        $("#classSelect").val("");
        $("#search-dropdown span").remove();
        loadClass();
    });
});

function init() {
    fetch(`/getIDs`).then(response => {
        return response.json();
    }).then(classes => {
        classList.push(...classes);
    });
    loadClass();
}

function loadClass() {
    progress(0);
    progress(20);
    let mainDiv = $("#timetable tbody");
    mainDiv.html("");
    fetch(`/getTimetable/${IDType}/${classID}/${currTime}`).then(response => {
        progress(50);
        return response.json();
    }).then(json => {
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
                `<tr class="time-row"><td class="timetable-entry timetable-time">${timeRows}</td></tr>`
            );
            for (let day in timetableData) {
                let lessons = "";
                for (let lesson of timetableData[day][i]) {
                    let modText = "";
                    if (lesson.special) modText = "special";
                    if (lesson.cancelled) modText = "cancelled";
                    let classTitle = `<div class="${modText}"><span class="entry-title">${lesson.cName}</span>`;
                    let room = "", teacher = "", instrName;
                    if (lesson.room != "" && lesson.tAcronym != "" && lesson.sNames != undefined && lesson.sNames.length > 0) {
                        room = `<span class="entry-room">${lesson.room}</span>`;
                        teacher = `<span class="entry-teacher">${lesson.tAcronym}</span>`;
                        instrName = `<br><span class="entry-instrName">${lesson.sNames[0].studentName}</span>`;
                    }
                    lessons += classTitle + room + teacher + ((lesson.cName == "IU") ? instrName : "") + "</div>";
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
                    $(".time-row").last().append(`
                        <td rowspan=${lLength} class="timetable-entry" data="${day + ";" + i}"><div class="sc_cont ${lengthName}"><div class="scroller">${lessons}</div></div></td>
                    `);
                }
                let scrollerEl = $(".time-row .scroller").last();
                if (scrollerEl.height() > scrollerEl.parent().height() && !$(".time-row .scroller").last().hasClass("scrolling")) {
                    scrollerEl.addClass("scrolling");
                    scrollerEl.last().html(scrollerEl.html() + scrollerEl.html());
                }
            }
        }
        progress(100);
    });
}

function setLessonData(lesson) {
    $("#teacher-detail").text(lesson.tFull);
    $("#personal-shit").html("<img>");
    $("#personal-shit img").attr("src", "spinner.svg")
    let img = new Image();
    img.src = "/getPicture/" + lesson.tId;
    img.onload = () => {
        $("#personal-shit img").addClass("teacher").attr("src", "/getPicture/" + lesson.tId);
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
            class: lesson.classId,
            tId: lesson.teacherId[0],
            tAcronym: lesson.teacherAcronym,
            tFull: lesson.teacherFullName,
            room: lesson.roomName,
            sNames: lesson.student,
            lessonLength: FULL_LESSON,
            hideForMultiple: false,
            special: lesson.timetableEntryTypeId == 15,
            cancelled: lesson.timetableEntryTypeId == 11
        };
        if (mLesson.cName == "IU") {
            if (insPersonIds.indexOf(mLesson.sNames[0].studentId) > -1) continue;
            insPersonIds.push(mLesson.sNames[0].studentId);
        }
        minimalLessons.push(mLesson);
    }
    minDate = new Date(parseInt(minimalLessons[0].lDate.substr(6)));
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
        for (let i = 0; i < result[day].length - 1; i++) { // skip last lesson of day
            let lessons = result[day][i];
            
            if (lessons.length == 0) continue;
            if (lessons.length != result[day][i + 1].length) continue;

            let lessonsAreEqual = true;

            for (let j = 0; j < lessons.length; j++) {
                let currLesson = result[day][i][j];
                let nextLesson = result[day][i + 1][j];
                if (
                    currLesson.cName != nextLesson.cName ||
                    currLesson.tAcronym != nextLesson.tAcronym ||
                    currLesson.sNames.length != nextLesson.sNames.length
                ) {
                    lessonsAreEqual = false;
                    break;
                }
                for (let i = 0; i < currLesson.sNames.length; i++) {
                    if (currLesson.sNames[i].studentId != nextLesson.sNames[i].studentId) {
                        lessonsAreEqual = false;
                    }
                }
            }
            if (lessonsAreEqual) {
                result[day][i][0].lessonLength = DOUBLE_LESSON;
                result[day][i + 1][0].hideForMultiple = true;
            }
        }
    }
    return result;
}

function dateToObjectKey(date) {
    return new Date(parseInt(date.substr(6))).toLocaleDateString("de-CH");
}

function getFirstDayOfWeek(d) {
    let day = d.getDay();
    let diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function progress(number) {
    $("#progress-bar").css("width", number + "%");
    if (number == 100) {
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
        } else {
            return val.name.toLowerCase().includes(input);
        }
    });
    for (let found of t) {
        if (found.classId) {
            $("#search-results").append(`<span class="searchResult" data="c${found.classId}">${found.className.replace(' ', '')}</span>`);
        } else {
            $("#search-results").append(`<span class="searchResult" data="t${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`);
        }
    }
}