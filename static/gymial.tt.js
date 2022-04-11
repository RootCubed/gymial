import * as gymial from "./gymial.module.js";

import { $s, $i, $c } from "./gymial.helper.js";

const timesPre73 = ["07:30-08:15", "08:25-09:10", "09:20-10:05", "10:25-11:10", "11:20-12:05", "12:25-13:10", "13:20-14:05", "14:15-15:00", "15:10-15:55", "16:05-16:50", "16:55-17:40"];
const shortTimesPre73 = [730, 825, 920, 1025, 1120, 1225, 1320, 1415, 1510, 1605, 1655];

const timesPost73 = ["07:30-08:15", "08:25-09:10", "09:30-10:15", "10:35-11:20", "11:40-12:25", "12:35-13:20", "13:40-14:25", "14:45-15:30", "15:40-16:25", "16:35-17:20", "17:20-18:05"];
const shortTimesPost73 = [730, 825, 920, 1035, 1140, 1235, 1340, 1445, 1540, 1635, 1720];

const ERROR_GENERIC = "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
"Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.";
const ERROR_NOCACHE = "Das TAM-Intranet ist momentan leider offline, und dieser Stundenplan wurde nie auf dem Server abgespeichert. " +
"Versuche es später wieder.";

const NEXT_SEM_START = 1646002800000;
const nextSemOnline = false;

let times = timesPre73;
let shortTimes = shortTimesPre73;

const DAY = 24 * 60 * 60 * 1000;

let timetableData;

let entityType = "class";
let entityID = 2659;
let currPeriod = 76;
let currClassName = "A4";

let currTime = getFirstDayOfWeek(new Date()).getTime();

let classList = [];

let weekOffset = 0;

export function init() {
    $i("today").setAttribute("data-content", weekOffset);
    
    // timetable entries
    document.addEventListener("click", el => {
        let tg = el.target;

        while (tg && tg.parentNode) {
            if (tg.classList.contains("timetable-entry") && !tg.classList.contains("empty") && !tg.classList.contains("timetable-time")) {
                clickTimetableEntry(tg);
            } else if (tg.classList.contains("searchResult")) {
                clickSearchResult(tg);
            }
            tg = tg.parentNode;
        }
        
        if (el.target.id != "class-select") {
            gymial.menu.hideSearchResults();
        }
    }, false);
    

    $i("week-back").addEventListener("click", () => {
        currTime -= DAY * 7;
        weekOffset--;
        refreshTodayEl();
        loadClass(true);
    });
    $i("today").addEventListener("click", () => {
        currTime = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = 0;
        refreshTodayEl();
        loadClass(true);
    });
    $i("week-forward").addEventListener("click", () => {
        currTime += DAY * 7;
        weekOffset++;
        refreshTodayEl();
        loadClass(true);
    });
    $i("forward-next-sem").addEventListener("click", () => {
        currTime = NEXT_SEM_START;
        let now = getFirstDayOfWeek(new Date()).getTime();
        weekOffset = Math.floor((NEXT_SEM_START - now) / (DAY * 7));
        refreshTodayEl();
        loadClass(true);
    });
    $i("backward-next-sem").addEventListener("click", () => {
        $i("today").click();
    });

    // clicking on class name
    $i("current-class").addEventListener("click", () => {
        if (currentView != 0) return; // timetable
        if ($i("margin-details").classList.contains("visible")) return;
        $i("overlay-lesson-tabs").innerHTML = "";
        $i("room-detail").innerHTML = "";
        $i("teacher-detail").innerHTML = "";
        $i("detail-view").innerHTML = "";
        $i("overlay-lesson-tabs").style.display = "none";
        if (IDType == "class") {
            fetch(`/class-personal-details/${entityID}`)
            .then(response => {
                if (response.status == 401) return 401;
                return response.json();
            }).then(res => {
                if (res == 401) {
                    showPwForm();
                    return;
                }
                if (res.status && res.status == "intranet_offline_nocache") {
                    gymial.detail.show(`<span>Das Intranet ist leider momentan offline. Versuche es später wieder.</span>`);
                    return;
                }
                let htmlToAdd = `<h1 style="margin-bottom: 20px">Klassenliste ${$i("current-class").innerText}</h1>`;
                for (let student of res) {
                    htmlToAdd += `<span class="student studentName person-link" data="${student.studentId}">${student.studentName}</span>`;
                }
                gymial.detail.show(htmlToAdd);
            });
        } else {
            if (entityType == "student") {
                fetch("/getName/" + parseInt(entityID)).then(res => res.json()).then(personName => {
                    if (personName.status && personName.status == "intranet_offline_nocache") {
                        gymial.detail.show(`<span>Das Intranet ist leider momentan offline. Versuche es später wieder.</span>`);
                    }
                    fetch(`/search-internal-kzoCH/${personName.firstname}/${personName.lastname}/_`).then(response => {
                        if (response.status == 401) {
                            return 401;
                        }
                        return response.json();
                    }).then(res => {
                        if (res == 401) {
                            showPwForm();
                            return;
                        }
                        let personalStuff = "";
                        for (let i = 3; i < 6; i++) {
                            personalStuff += "<p>" + res[0][i] + "</p>";
                        }
                        gymial.detail.show(`<div class="student"><h1>${personName.firstname + " " + personName.lastname}</h1><br><div class="personalDetails">${personalStuff}</div></div>`);
                    });
                });
            } else {
                gymial.detail.show(`<div class="student"><h1>${$i("current-class").innerText}</h1><br><p>Lehrerinformationen werden bald hinzugefügt.</p></div>`);
            }
        }
    });

    loadTTData(entityType, entityID, currTime);
}

export async function loadTTData(entityType, entityID, time, resources) {
    if (!resources) {
        resources = await loadResources(time);
    }
    if (!resources || resources.length == 0) return;

    if (!activeEntity(resources, entityType, entityID)) {
        entityID = classList[0].classId;
        entityType = "class";
        currClassName = classList[0].className.replace(' ', '');
        try {
            let json = JSON.parse(window.localStorage.getItem("class"));
            if (entityID == json.id) throw "localStorage is from this semester";
            entityID = json.id;
            currClassName = json.name;
        } catch (e) {}
        setClassName();
    }

    loadPeriod(time).then(period => {
        if (!period) return;
        if (period != currPeriod) {
            currPeriod = period;
            gymial.store.loadSearchHistory(currPeriod);
            loadTTData(entityType, entityID, time);
            return;
        }
        loadClass(resources, entityType, entityID, time, period);
    });
}

export function isNextSemOnline() {
    return isNextSemOnline;
}

export function setClass(id) {
    entityID = id;
}

export function getCurrPeriod() {
    return currPeriod;
}

export function setClassName() {
    gymial.menu.overrideTitle(currClassName);
}

let canUseAbortController = !!AbortController;
let classLoadingController, classLoadingSignal;
if (canUseAbortController) {
    classLoadingController = new AbortController();
    classLoadingSignal = classLoadingController.signal;
}

function refreshTodayEl() {
    let todayEl = $i("today");
    todayEl.setAttribute("data-content", weekOffset);
    todayEl.classList.add("repaint");
    todayEl.classList.remove("repaint"); // small hack for WebKit browsers
    $i("hint-new-timetable").classList.remove("visible");
}

async function loadResources(time) {
    gymial.menu.setProgress(10);
    gymial.error.hide();
    enableDisableSemButton();
    $s("#timetable tbody").innerHTML = "";
    try {
        let timeReq = await fetch(`/resources/${time}`);
        let classes = await timeReq.json();
        if (classes.status != "ok") {
            console.warn("Resources returned " + classes.status);
            if (classes.status == "intranet_offline_nocache") throw classes.status;
        }
        if (classes.data.offline) {
            gymial.menu.overrideTitle("Offline");
            gymial.menu.setProgress(100);
            return;
        }
        return classes.data.data;

    } catch (e) {
        if (e.name != "AbortError") {
            console.error(`Error loading /resources/${time}`);
            gymial.error.show("Netzwerkfehler", ERROR_GENERIC);
        }
        gymial.menu.setProgress(100);
    }
    return null;
}

function activeEntity(resources, type, id) {
    if (type != "class") return true;

    let cInClassList = false;
    for (let c of resources) {
        if (c.classId == id) {
            cInClassList = true;
            break;
        }
    }
    return cInClassList;
}

async function loadPeriod(time) {
    gymial.menu.setProgress(20);
    try {
        let periodReq = await fetch(`/period-from-time/${time}`, {
            signal: classLoadingSignal
        });
        let period = parseInt(await periodReq.text());
        return period;
    } catch (e) {
        if (e.name != "AbortError") {
            console.error(`Error loading /period-from-time/${time}`);
            displayError("Netzwerkfehler", ERROR_GENERIC);
            gymial.menu.setProgress(100);
        }
    }
    return null;
}

async function loadClass(resources, entityType, id, time, period) {
    gymial.menu.setProgress(30);
    gymial.error.hide();
    gtag("event", "loadClass");
    $s("#timetable tbody").innerHTML = "";
    if (period >= 73) {
        times = timesPost73;
        shortTimes = shortTimesPost73;
    } else {
        times = timesPre73;
        shortTimes = shortTimesPre73;
    }
    let ttData;
    let shouldShow = true;
    try {
        let ttReq = await fetch(`/timetable/${entityType}/${entityID}/${time}`, {
            signal: classLoadingSignal
        });
        ttData = await ttReq.json();
        gymial.menu.setProgress(50);
        if (ttData.status == "intranet_offline_nocache") {
            gymial.error.show("TAM-Intranet offline", ERROR_NOCACHE);
            gymial.menu.setProgress(100);
            return;
        } else if (ttData.status == "intranet_offline") {
            shouldShow = false;
            let time = new Date(ttData.time);
            gymial.error.show("TAM-Intranet offline", "Das TAM-Intranet ist momentan leider offline. Klicke <a href='#' id='view-cached'>hier</a>," +
            ` um die zuletzt geladene Version dieses Studenplans anschauen (Stand: ${time.toLocaleTimeString([], {
                year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
            })})`);
            gymial.menu.setProgress(100);
            $i("view-cached").addEventListener("click", () => {
                gymial.error.hide();
                $s("#timetable tbody").innerHTML = timetableHTML(timetableData);
                applyScrolling();
            });
        }
        ttData = ttData.data;
    } catch (e) {
        if (e.name !== "AbortError") {
            console.error(`Error loading /timetable/${entityType}/${entityID}/${time}`);
            gymial.error.show("Netzwerkfehler", ERROR_GENERIC);
            gymial.menu.setProgress(100);
        }
        return;
    }
    if (ttData.error) {
        gymial.error.show("TAM-Fehler", ttData.data);
        gymial.menu.setProgress(100);
        return;
    }
    if (entityType == "class") {
        for (let i = 0; i < classList.length; i++) {
            if (!classList[i].classId) break;
            if (classList[i].classId == entityID) {
                currClassName = classList[i].className.replace(' ', '');
            }
        }
    } else if (IDType == "student") {
        currClassName = idToName(entityID) + " (" + classFromTTData(ttData).replace(/ /g, '') + ")";
    }
    // if the user hasn't clicked away yet
    if (gymial.menu.getCurrentView() == 0) {
        setClassName();
    }
    gymial.menu.setProgress(60);
    timetableData = convertToUsable(ttData);
    
    if (shouldShow) {
        $s("#timetable tbody").innerHTML = timetableHTML(timetableData);
        applyScrolling();
    }

    gymial.menu.setProgress(100);
}

function applyScrolling() {
    $c("scroller").forEach(scrollerEl => {
        scrollerEl.classList.remove("scrolling");
        let addScroller = scrollerEl.getElementsByClassName("addScroller")[0];
        addScroller.innerHTML = "";
        if (scrollerEl.offsetHeight > scrollerEl.parentNode.offsetHeight) {
            scrollerEl.classList.add("scrolling");
            addScroller.innerHTML = scrollerEl.innerHTML; // duplicate text
        }
    });
}

function enableDisableSemButton() {
    if (!nextSemOnline) {
        $i("forward-next-sem").style.display = "none";
        $i("backward-next-sem").style.display = "none";
    } else {
        if (currTime >= NEXT_SEM_START) {
            $i("forward-next-sem").style.display = "none";
            $i("backward-next-sem").style.display = "inline";
        } else {
            $i("forward-next-sem").style.display = "inline";
            $i("backward-next-sem").style.display = "none";
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
    if (!!lesson.tFull) {
        $i("teacher-detail").innerText = lesson.tFull;
    } else {
        $i("teacher-detail").innerText = "";
    }
    $i("detail-view").innerHTML = "<div id='names'></div>";
    if (lesson.cId) {
        fetch("/course-participants/" + lesson.cId).then(r => {
            if (r.status == 401) return 401;
            return r.json();
        }).then(res => {
            if (res == 401) {
                showPwForm();
                return;
            }
            let html = "";
            if (res.status && res.status == "intranet_offline_nocache") {
                html += `<span>Das Intranet ist leider momentan offline. Versuche es später wieder.</span>`;
            } else {
                for (let r of res) {
                    html += `<span class="student studentName person-link" data="${r.id}">${r.name}</span>`;
                }
            }
            $i("names").innerHTML = html;
            for (let link of $c("person-link")) {
                link.addEventListener("click", el => {
                    clickPersonInLessonView(el.target);
                });
            }
        });
    } else {
        $i("names").innerHTML = "Keine Informationen über die Teilnehmer an diesem Kurs!";
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
        let currRef;
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

function timetableHTML(timetableData) {
    let mainDivHTML = "";
    let dates = "";
    for (let day in timetableData) {
        dates += `<th class="timetable-date">${day}</th>`;
    }
    mainDivHTML += `<tr><td class="timetable-time"></td>${dates}</tr>`;
    for (let i = 0; i < times.length; i++) {
        let timeRows = times[i].replace(/-/g, "-<wbr>");
        mainDivHTML += `<tr class="time-row"><td class="timetable-entry timetable-time timetable-lesson-times">${timeRows}</td>`;
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
                mainDivHTML += `<td rowspan=${timetableData[day][i].length} class="timetable-entry empty"><div class="sc_cont"></div></td>`;
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
                    lengthName = "fullday";
                }
                mainDivHTML += `<td rowspan=${lLength} class="timetable-entry ${isSpecial}" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>`;
            }
        }
        mainDivHTML += `</tr>`;
    }
    return mainDivHTML;
}

function clickTimetableEntry(el) {
    let lessonIndex = el.getAttribute("data").split(';');
    let lessons = timetableData[lessonIndex[0]][lessonIndex[1]].data;
    let htmlString = "";
    for (let lesson of lessons) {
        if (lesson.special) return;
        htmlString += `<a class="overlay-tab">${lesson.cName}</a>`;
    }
    $i("overlay-lesson-tabs").style.display = "inline";
    $i("overlay-lesson-tabs").innerHTML = htmlString;
    $i("overlay-lesson-tabs").children[0].classList.add("active");
    setLessonData(lessons[0]);
    gymial.detail.show();
    $c("overlay-tab").forEach(el => el.addEventListener("click", el => {
        let tg = el.target;
        let currActive = document.querySelector("#overlay-lesson-tabs .active");
        if (tg == currActive) return;
        currActive.classList.remove("active");
        tg.classList.add("active");
        let index = Array.from(tg.parentNode.children).indexOf(tg);
        setLessonData(lessons[index]);
    }));
}

function clickPersonInLessonView(el) {
    entityType = "student";
    entityID = parseInt(el.getAttribute("data"));
    gymial.menu.overrideTitle(el.innerText);
    loadTTData(entityType, entityID, currTime, classList);
    gymial.detail.hide();
}