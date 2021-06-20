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

const NEXT_SEM_START = 1629752236880;
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
document.body.style.setProperty('--wh', `${wh}px`);

let $s = selector => document.querySelector(selector);
let $i = id => document.getElementById(id);
let $c = className => Array(...document.getElementsByClassName(className));

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
        $i("current-class").innerText = json.name;
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

if (document.readyState != "loading"){
    initGymial();
} else {
    document.addEventListener("DOMContentLoaded", initGymial);
}

function initGymial() {
    $i("today").setAttribute("data-content", weekOffset);
    setTimeout(() => {
        $i("margin-details").classList.remove("no-transition");
    }, 500);

    // try to see if we are already logged in
    getPersData();

    // get mensa data
    loadMensa("KZO", false);

    // timetable entries
    document.addEventListener("click", el => {
        let tg = el.target;

        while (tg && tg.parentNode) {
            if (tg.classList.contains("timetable-entry") && !tg.classList.contains("empty") && !tg.classList.contains("timetable-time")) {
                clickTimetableEntry(tg);
            } else if (tg.classList.contains("searchResult")) {
                clickSearchResult(tg);
            } else if (tg.classList.contains("person-link")) {
                clickPersonInLessonView(tg);
            }
            tg = tg.parentNode;
        }
        
        if (el.target.id != "classSelect") {
            hideSearchResults();
        }
    }, false);

    let refreshTodayEl = () => {
        let todayEl = $i("today");
        todayEl.setAttribute("data-content", weekOffset);
        todayEl.classList.add("repaint");
        todayEl.classList.remove("repaint"); // small hack for WebKit browsers
    };

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
    $i("open-menu").addEventListener("click", () => {
        $i("sidebar").classList.toggle("visible");
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
                $i("sidebar").classList.add("visible");
            } else if (swipeStartX - t.screenX > 50) {
                $i("sidebar").classList.remove("visible");
            }
        }
    });
    $i("margin-details").addEventListener("click", el => {
        if (el.target.id != "margin-details") return;
        $i("margin-details").classList.remove("visible");
    });
    $c("icon-x")[0].addEventListener("click", () => {
        $i("margin-details").classList.remove("visible");
    });

    let myAccountClickCount = 0;

    // clicking on class name
    $i("current-class").addEventListener("click", () => {
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
        if ($i("margin-details").classList.contains("visible")) return;
        $i("overlay-lesson-tabs").innerHTML = "";
        $i("room-detail").innerHTML = "";
        $i("teacher-detail").innerHTML = "";
        $i("detail-view").innerHTML = "";
        $i("overlay-lesson-tabs").style.display = "none";
        if (IDType == "class") {
            fetch(`/class-personal-details/${classID}`)
            .then(response => {
                if (response.status == 401) return 401;
                return response.json();
            }).then(res => {
                if (res == 401) {
                    $i("link-account").click();
                    return;
                };
                $i("margin-details").classList.add("visible");
                let htmlToAdd = `<h1 style="margin-bottom: 20px">Klassenliste ${$i("current-class").innerText}</h1>`;
                for (let student of res) {
                    htmlToAdd += `<div class="student"><p class="studentName">${student.studentName}</p></div>`;
                }
                $i("detail-view").innerHTML += htmlToAdd;
            });
        } else {
            $i("margin-details").classList.add("visible");
            if (IDType == "student") {
                fetch("/getName/" + parseInt(classID)).then(res => res.json()).then(personName => {
                    fetch(`/search-internal-kzoCH/${personName.firstname}/${personName.lastname}/_`).then(response => {
                        if (response.status == 401) {
                            return 401;
                        }
                        return response.json();
                    }).then(res => {
                        if (res == 401) {
                            $i("link-account").click();
                            return;
                        };
                        let personalStuff = "";
                        for (let i = 3; i < 6; i++) {
                            personalStuff += "<p>" + res[0][i] + "</p>";
                        }
                        $i("detail-view").innerHTML =
                            `<div class="student"><h1>${personName.firstname + " " + personName.lastname}</h1><br><div class="personalDetails">${personalStuff}</div></div>`;
                    });
                });
            } else {
                $i("detail-view").innerHTML =
                    `<div class="student"><h1>${$i("current-class").innerText}</h1><br><p>Lehrerinformationen werden bald hinzugefügt.</p></div>`;
            }
        }
    });

    $i("logout").addEventListener("click", ev => {
        $i("invalid-login").style.display = "none";
        $i("login-form").style.display = "inline";
        $i("accountinfo").style.display = "none";
        Cookies.remove("username");
        Cookies.remove("apiToken");
        window.localStorage.removeItem("api");
    });

    $i("persplan").addEventListener("click", ev => {
        classID = persData.PersonID;
        IDType = "student";
        currClassName = persData.Nachname + ", " + persData.Vorname;
        loadClass(true);
        $i("link-timetable").click();
    });

    // logging in
    $i("login-form").addEventListener("submit", ev => {
        $i("invalid-login").style.display = "none";
        $i("login-submit").style.display = "none";
        let spinner = $s("#button-spinner img");
        spinner.style.display = "inline";
        ev.preventDefault();
        fetch("/auth", {
            method: "post",
            body: `user=${$i("login-user").value}&pass=${$i("login-pw").value}`
        }).then(res => {
            if (res.status == 401) {
                // Unsuccessful authentication
                $i("invalid-login").display.style = "inline";
                $i("login-submit").display.style = "inline";
                spinner.style.display = "none";
                return;
            }
            return res.text();
        }).then(token => {
            if (!token) return;
            window.localStorage.setItem("api", JSON.stringify({username: $i("login-user").value, token: token}));
            Cookies.set("username", $i("login-user").value, {expires: 30, path: ""});
            Cookies.set("apiToken", token, {expires: 30, path: ""});
            getPersData();
            init(); // resources will be different when logged in
            $i("link-timetable").click();
        });
        return false;
    });

    // sidebar link
    $c("sidebar-link").forEach(el => el.addEventListener("click", el => {
        $i("margin-details").classList.remove("visible");
        $i("panel-timetable").className = "canScroll";
        $i("current-class").classList.add("noclick");
        $c("sidebar-link").forEach(el => el.classList.remove("active"));
        switch(el.target.innerText) {
            case VIEW_NAMES[0]:
                $i("current-class").innerText = currClassName;
                $i("panel-timetable").classList.add("scrollTimetable");
                $c("sidebar-link").forEach(el => el.classList.remove("active"));
                $i("link-timetable").classList.add("active");
                $i("week-btns").classList.remove("hide");
                $i("current-class").classList.remove("noclick");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $i("current-class").innerText = VIEW_NAMES[1];
                $i("panel-timetable").classList.add("scrollLogin");
                $i("link-account").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 1;
                break;
            case VIEW_NAMES[2]:
                $i("current-class").innerHTML = `${VIEW_NAMES[2]} <span id="toggle-mensa">${currMensa}</span>`;
                $i("toggle-mensa").addEventListener("click", () => {
                    if (currMensa == "KZO") {
                        currMensa = "Schellerstrasse";
                    } else {
                        currMensa = "KZO";
                    }
                    $i("toggle-mensa").innerText = currMensa;
                    loadMensa(currMensa, true);
                });
                $i("panel-timetable").classList.add("scrollMensa");
                $i("link-mensa").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 2;
                break;
        }
        $i("sidebar").classList.remove("visible");
        setTimeout(() => $i("panel-timetable").classList.remove("canScroll"), 500);
        return;
    }));

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
}

function init() {
    $i("error-timetable").classList.remove("visible");
    progress(10);
    enableDisableSemButton();
    $s("#timetable tbody").innerHTML = "";
    fetch(`/resources/${currTime}`).then(response => {
        return response.json();
    }).then(classes => {
        progress(20);
        if (classes.offline) {
            $i("current-class").innerText = "Offline";
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
                        $i("current-class").innerText = json.name;
                    } catch (e) {
                        classID = classes[0].classId;
                        IDType = "class";
                        currClassName = classes[0].className.replace(' ', '');
                        $i("current-class").innerText = currClassName;
                    }
                } else {
                    classID = classes[0].classId;
                    IDType = "class";
                    currClassName = classes[0].className.replace(' ', '');
                    $i("current-class").innerText = currClassName;
                }
            }
        }
        loadClass(false);
    })
    .catch(e => {
        if (e.name !== "AbortError") {
            console.error(`Error loading /resources/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
            "Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.");
        }
        progress(100);
    });
}

function clickTimetableEntry(el) {
    let lessonIndex = el.getAttribute("data").split(';');
    let lessons = timetableData[lessonIndex[0]][lessonIndex[1]].data;
    let htmlString = "";
    for (let lesson of lessons) {
        if (lesson.special) return;
        htmlString += `<a class="overlay-tab">${lesson.cName}</a>`
    }
    $i("overlay-lesson-tabs").style.display = "inline";
    $i("overlay-lesson-tabs").innerHTML = htmlString;
    $i("overlay-lesson-tabs").children[0].classList.add("active");
    setLessonData(lessons[0]);
    $i("margin-details").classList.add("visible");
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

function clickSearchResult(el) {
    let name = el.innerText;
    $i("current-class").innerText = name;
    classID = el.getAttribute("data");
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
    $i("classSelect").value = "";
    loadClass(true);
}

function clickPersonInLessonView(el) {
    IDType = "student";
    classID = parseInt(el.getAttribute("data"));
    $i("current-class").innerText = el.innerText;
    loadClass(true);
    $i("margin-details").classList.remove("visible");
}

let canUseAbortController = !!AbortController;
let classLoadingController, classLoadingSignal;
if (canUseAbortController) {
    classLoadingController = new AbortController();
    classLoadingSignal = classLoadingController.signal;
}

function loadClass(startAtZero) {
    $i("error-timetable").classList.remove("visible");
    if (startAtZero) progress(10);
    if (canUseAbortController) {
        classLoadingController.abort();
        classLoadingController = new AbortController();
        classLoadingSignal = classLoadingController.signal;
    }
    $s("#timetable tbody").innerHTML = "";
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
            if (json.error) {
                displayError("TAM-Fehler", json.error);
                progress(100);
                return;
            }
            if (IDType == "class") {
                for (let i = 0; i < classList.length; i++) {
                    if (!classList[i].classId) break;
                    if (classList[i].classId == classID) {
                        currClassName = classList[i].className.replace(' ', '');
                        $i("current-class").innerText = currClassName;
                    }
                }
            }
            if (IDType == "student") {
                $i("current-class").innerText = idToName(classID) + " (" + classFromTTData(json).replace(/ /g, '') + ")";
            }
            mainDivHTML = "";
            progress(60);
            rawData = json;
            timetableData = convertToUsable(json);
            let dates = "";
            for (let day in timetableData) {
                dates += `<th class="timetable-date">${day}</th>`;
            }
            mainDivHTML += `<tr><td class="timetable-time"></td>${dates}</tr>`;
            for (let i = 0; i < times.length; i++) {
                let timeRows = times[i];
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
                            lengthName = "fullday"
                        }
                        mainDivHTML += `<td rowspan=${lLength} class="timetable-entry ${isSpecial}" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>`;
                    }
                }
                mainDivHTML += `</tr>`;
            }
            $s("#timetable tbody").innerHTML = mainDivHTML;
            applyScrolling();
            progress(100);
        })
        .catch(e => {
            if (e.name !== "AbortError") {
                console.error(`Error loading /timetable/${IDType}/${classID}/${currTime}`);
                displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
                "Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.");
            }
            progress(100);
        });
    })
    .catch(e => {
        if (e.name !== "AbortError") {
            console.error(`Error loading /period-from-time/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
            "Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.");
        }
        progress(100);
    });
}

function getPersData() {
    fetch("/myData").then(res => res.json()).then(res => {
        if (res.total > 0) {
            persData = res.data[0];
            $i("ownName").innerText = persData.Vorname + " " + persData.Nachname;
            $i("otherDetails").innerText = persData.Adresse + ", " + persData.PLZ + " " + persData.Ort;
            $i("login-form").style.display = "none";
            $i("accountinfo").style.display = "inline";
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
        $s("#mensa-table tbody").innerHTML = tableHtml;
        if (showProgress) progress(100);
    });
}

let lastEvTime;
let timeout = false;
let debounceDelay = 100;
function resizeScreen() {
    // still set the wh variable, but we don't re-apply the scrolling effect yet
    let wh = window.innerHeight;
    if (document.body.style.getPropertyValue("--wh") != `${wh}px`) {
        document.body.style.setProperty("--wh", `${wh}px`);
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
    $i("teacher-detail").innerText = lesson.tFull;
    $i("detail-view").innerHTML = "<div id='names'></div>";
    if (lesson.cId) {
        fetch("/course-participants/" + lesson.cId).then(r => {
            if (r.status == 401) return 401;
            return r.json();
        }).then(res => {
            if (res == 401) {
                $i("link-account").click();
                return;
            }
            let html = "";
            for (let r of res) {
                html += `<span class="student studentName person-link" data="${r.id}">${r.name}</span>`
            }
            $i("names").innerHTML = html;
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
    $i("progress-bar").style.width = number + "%";
    if (number === 100) {
        setTimeout (() => {
            $i("progress-bar").style.backgroundColor = "white";
        }, 500);
        setTimeout (() => {
            $i("progress-bar").style.width = "0%";
        }, 1000);
        setTimeout (() => {
            $i("progress-bar").style.backgroundColor = "#329F5B";
        }, 1500);
    }
}

function filterObjects() {
    let input = $i("classSelect").value.toLowerCase().replace(' ', '');
    $i("search-results").innerHTML = "";
    if (input.length < 1) {
        for (let search of searches) {
            $i("search-results").innerHTML += `<span class="searchResult" data="${search.id}">${search.name}</span>`;
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
    let resultHTML = "";
    for (let found of t) {
        if (found.classId) {
            resultHTML += `<span class="searchResult" data="c${found.classId}">${found.className.replace(' ', '')}</span>`;
        } else if (found.acronym) {
            resultHTML += `<span class="searchResult" data="t${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`;
        } else if (found.room) {
            resultHTML += `<span class="searchResult" data="r${found.roomId}">${found.room}</span>`;
        } else {
            resultHTML += `<span class="searchResult" data="s${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`;
        }
    }
    $i("search-results").innerHTML = resultHTML;
}

function hideSearchResults() {
    $i("search-results").innerHTML = "";
}

function displayError(title, message) {
    $i("error-title").innerText = title;
    $i("error-desc").innerHTML = message;
    $i("error-timetable").classList.add("visible");
}