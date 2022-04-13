import * as gymial from "./gymial.module.js";

import * as ttdata from "./gymial.ttdata.js";

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

let viewState = {
    entityType: "class",
    entityID: 2659,
    entityName: "A4",
    selPersonName: "",
    time: ttdata.getFirstDayOfWeek(new Date()).getTime(),
    currPeriod: 76,
    currResources: null,
    currTT: null,
    weekOffset: 0
};

export function init() {
    $i("today").setAttribute("data-content", viewState.weekOffset);
    
    // timetable entries
    document.addEventListener("click", el => {
        let tg = el.target;

        while (tg && tg.parentNode) {
            if (tg.classList.contains("timetable-entry") && !tg.classList.contains("empty") && !tg.classList.contains("timetable-time")) {
                clickTimetableEntry(tg);
            }
            tg = tg.parentNode;
        }
        
        if (el.target.id != "class-select") {
            gymial.menu.hideSearchResults();
        }
    }, false);
    

    $i("week-back").addEventListener("click", () => {
        viewState.time -= ttdata.DAY * 7;
        viewState.weekOffset--;
        refreshTodayEl();
        reloadClass();
    });
    $i("today").addEventListener("click", () => {
        viewState.time = getFirstDayOfWeek(new Date()).getTime();
        viewState.weekOffset = 0;
        refreshTodayEl();
        reloadClass();
    });
    $i("week-forward").addEventListener("click", () => {
        viewState.time += ttdata.DAY * 7;
        viewState.weekOffset++;
        refreshTodayEl();
        reloadClass();
    });
    $i("forward-next-sem").addEventListener("click", () => {
        viewState.time = NEXT_SEM_START;
        let now = getFirstDayOfWeek(new Date()).getTime();
        viewState.weekOffset = Math.floor((NEXT_SEM_START - now) / (DAY * 7));
        refreshTodayEl();
        reloadClass();
    });
    $i("backward-next-sem").addEventListener("click", () => {
        $i("today").click();
    });

    // clicking on class name
    $i("current-class").addEventListener("click", () => {
        if (gymial.menu.getCurrentView() != 0) return; // timetable
        if ($i("margin-details").classList.contains("visible")) return;
        $i("overlay-lesson-tabs").innerHTML = "";
        $i("room-detail").innerHTML = "";
        $i("teacher-detail").innerHTML = "";
        $i("detail-view").innerHTML = "";
        $i("overlay-lesson-tabs").style.display = "none";
        if (viewState.entityType == "class") {
            fetch(`/class-personal-details/${viewState.entityID}`)
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
            if (viewState.entityType == "student") {
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

    loadTTData(viewState.entityType, viewState.entityID, viewState.time);
}

export async function loadTTData(entityType, entityID, time, resources) {
    viewState.entityType = entityType;
    viewState.entityID = entityID;
    if (!resources) {
        resources = await loadResources(time);
    }
    if (!resources || resources.length == 0) return;
    
    enableDisableSemButton(time);

    let entityName = (entityType == "student") ? viewState.selPersonName : viewState.entityName;
    if (!isActiveEntity(resources, entityType, entityID)) {
        entityID = resources[0].classId;
        entityType = "class";
        entityName = resources[0].className.replace(' ', '');
        try {
            let json = JSON.parse(window.localStorage.getItem("class"));
            if (entityID == json.id) throw "localStorage is from this semester";
            entityID = json.id;
            entityName = json.name;
        } catch (e) {}
    }
    setClassName(entityName);

    loadPeriod(time).then(period => {
        if (!period) return;
        if (viewState.currPeriod != period) {
            viewState.currPeriod = period;
            gymial.store.loadSearchHistory(currPeriod);
            loadTTData(entityType, entityID, time);
            return;
        }
        loadClass(resources, entityType, entityID, time, period);
    });
}

export function isNextSemOnline() {
    return nextSemOnline;
}

export function setClass(id) {
    entityID = id;
}

export function setClassName(name) {
    viewState.entityName = name;

    // If the user hasn't clicked away yet
    if (gymial.menu.getCurrentView() == 0) {
        gymial.menu.overrideTitle(name);
    }
}

export function getClassName() {
    return viewState.entityName;
}

export function setSelectedPerson(name) {
    viewState.selPersonName = name;
    setClassName(name);
}

export function getCurrResources() {
    return viewState.currResources;
}

export function getCurrTime() {
    return viewState.time;
}

export function getCurrPeriod() {
    return viewState.currPeriod;
}

export function resizeEvent() {
    applyScrolling();
}

function reloadClass() {
    loadTTData(viewState.entityType, viewState.entityID, viewState.time, viewState.currResources);
}

let canUseAbortController = !!AbortController;
let classLoadingController, classLoadingSignal;
if (canUseAbortController) {
    classLoadingController = new AbortController();
    classLoadingSignal = classLoadingController.signal;
}

function refreshTodayEl() {
    let todayEl = $i("today");
    todayEl.setAttribute("data-content", viewState.weekOffset);
    todayEl.classList.add("repaint");
    todayEl.classList.remove("repaint"); // small hack for WebKit browsers
    $i("hint-new-timetable").classList.remove("visible");
}

async function loadResources(time) {
    gymial.menu.setProgress(10);
    gymial.error.hide();
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

function isActiveEntity(resources, type, id) {
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

async function loadClass(resources, entityType, entityID, time, period) {
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
                $s("#timetable tbody").innerHTML = ttdata.buildHTML(viewState.currTT);
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
    let entityName = viewState.entityName;
    if (entityType == "student") {
        entityName = viewState.selPersonName + " (" + ttdata.classFromTTData(ttData) + ")";
    }
    setClassName(entityName);
    gymial.menu.setProgress(60);
    viewState.currTT = ttdata.convertToUsable(ttData, time, times, shortTimes);
    
    if (shouldShow) {
        $s("#timetable tbody").innerHTML = ttdata.buildHTML(viewState.currTT, times);
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

function enableDisableSemButton(time) {
    if (!isNextSemOnline()) {
        $i("forward-next-sem").style.display = "none";
        $i("backward-next-sem").style.display = "none";
    } else {
        if (time >= NEXT_SEM_START) {
            $i("forward-next-sem").style.display = "none";
            $i("backward-next-sem").style.display = "inline";
        } else {
            $i("forward-next-sem").style.display = "inline";
            $i("backward-next-sem").style.display = "none";
        }
    }
}

function setLessonData(lesson) {
    if (!!lesson.tFull) {
        $i("teacher-detail").innerText = lesson.tFull;
    } else {
        $i("teacher-detail").innerText = "";
    }
    gymial.detail.show("<div id='names'></div>");
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
            $c("person-link").forEach(link => link.addEventListener("click", el => {
                let name = el.target.innerText;
                let id = parseInt(el.getAttribute("data"));
                gymial.menu.overrideTitle(name);
                setSelectedPerson(name);
                loadTTData("student", id, viewState.time, viewState.currResources); // TODO: fix!
                gymial.detail.hide();
            }));
        });
    } else {
        $i("names").innerHTML = "Keine Informationen über die Teilnehmer an diesem Kurs!";
    }
}

function clickTimetableEntry(el) {
    let lessonIndex = el.getAttribute("data").split(';');
    let lessons = viewState.currTT[lessonIndex[0]][lessonIndex[1]].data;
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