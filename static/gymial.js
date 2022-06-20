const timesPre73Post76 = ["07:30-08:15", "08:25-09:10", "09:20-10:05", "10:25-11:10", "11:20-12:05", "12:25-13:10", "13:20-14:05", "14:15-15:00", "15:10-15:55", "16:05-16:50", "16:55-17:40"];
const shortTimesPre73Post76 = [730, 825, 920, 1025, 1120, 1225, 1320, 1415, 1510, 1605, 1655];

const timesPost73 = ["07:30-08:15", "08:25-09:10", "09:30-10:15", "10:35-11:20", "11:40-12:25", "12:35-13:20", "13:40-14:25", "14:45-15:30", "15:40-16:25", "16:35-17:20", "17:20-18:05"];
const shortTimesPost73 = [730, 825, 920, 1035, 1140, 1235, 1340, 1445, 1540, 1635, 1720];

const NEXT_SEM_START = 1661119200000;
const nextSemOnline = true;

let times = timesPre73Post76;
let shortTimes = shortTimesPre73Post76;

const DAY = 24 * 60 * 60 * 1000;

let timetableData;

let IDType = "class";
let classID = 2733;
let currPeriod = 76;
let persData;

let avStyles;
let currStyleName = "Classic Dark";

let currMensa = "KZO";

let wh = window.innerHeight;
document.body.style.setProperty('--wh', `${wh}px`);

// helper functions
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

if (window.localStorage.getItem("style")) {
    try {
        let currentStyle = JSON.parse(window.localStorage.getItem("style"));
        applyStyle(currentStyle);
        currStyleName = currentStyle.name;
    } catch (e) {}
}

let searchHistoryName, searches;
loadSearchHistory();

if (nextSemOnline && window.localStorage) {
    let shouldShowHint = false;
    if (window.localStorage.getItem("seenNextSemHint")) {
        if (window.localStorage.getItem("seenNextSemHint") < currPeriod) shouldShowHint = true;
    } else {
        shouldShowHint = true;
    }
    window.localStorage.setItem("seenNextSemHint", currPeriod);
    if (shouldShowHint) {
        $i("hint-new-timetable").classList.add("visible");
    }
}

let currTime = getFirstDayOfWeek(new Date()).getTime();

let classList = [];

let weekOffset = 0;

let currentView = 0;
const VIEW_NAMES = ["Stundenplan", "Einstellungen", "Mensaplan"];
let currClassName = "A4";

if (document.readyState == "complete"){
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
    postLogin();

    // get mensa data
    loadMensa("KZO", false);

    try {
        loadStyles();
    } catch (e) {}
    $i("styleprevsvg").addEventListener("load", loadStyles);

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
        
        if (el.target.id != "class-select") {
            hideSearchResults();
        }
    }, false);

    let refreshTodayEl = () => {
        let todayEl = $i("today");
        todayEl.setAttribute("data-content", weekOffset);
        todayEl.classList.add("repaint");
        todayEl.classList.remove("repaint"); // small hack for WebKit browsers
        $i("hint-new-timetable").classList.remove("visible");
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
    let allowSwipe = false;
    document.addEventListener("touchstart", event => {
        let t = event.touches[0];
        swipeStartX = t.screenX; 
        swipeStartY = t.screenY;
        allowSwipe = !$i("stylepicker_cont").contains(t.target);
    });
    document.addEventListener("touchmove", event => {
        if (!allowSwipe) return;
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
            fetch(`/class-personal-details/${classID}`)
            .then(response => {
                if (response.status == 401) return 401;
                return response.json();
            }).then(res => {
                if (res == 401) {
                    showPwForm();
                    return;
                };
                if (res.status && res.status == "intranet_offline_nocache") {
                    showDetails(`<span>Das Intranet ist leider momentan offline. Versuche es später wieder.</span>`);
                    return;
                }
                let htmlToAdd = `<h1 style="margin-bottom: 20px">Klassenliste ${$i("current-class").innerText}</h1>`;
                for (let student of res) {
                    htmlToAdd += `<span class="student studentName person-link" data="${student.studentId}">${student.studentName}</span>`;
                }
                showDetails(htmlToAdd);
            });
        } else {
            if (IDType == "student") {
                fetch("/getName/" + parseInt(classID)).then(res => res.json()).then(personName => {
                    if (personName.status && personName.status == "intranet_offline_nocache") {
                        showDetails(`<span>Das Intranet ist leider momentan offline. Versuche es später wieder.</span>`);
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
                        };
                        let personalStuff = "";
                        for (let i = 3; i < 6; i++) {
                            personalStuff += "<p>" + res[0][i] + "</p>";
                        }
                        showDetails(`<div class="student"><h1>${personName.firstname + " " + personName.lastname}</h1><br><div class="personalDetails">${personalStuff}</div></div>`);
                    });
                });
            } else {
                showDetails(`<div class="student"><h1>${$i("current-class").innerText}</h1><br><p>Lehrerinformationen werden bald hinzugefügt.</p></div>`);
            }
        }
    });

    $i("persplan").addEventListener("click", ev => {
        classID = persData.PersonID;
        IDType = "student";
        currClassName = persData.Nachname + ", " + persData.Vorname;
        loadClass(true);
        $i("link-timetable").click();
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
                $i("link-timetable").classList.add("active");
                $i("week-btns").classList.remove("hide");
                $i("current-class").classList.remove("noclick");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $i("current-class").innerText = VIEW_NAMES[1];
                $i("panel-timetable").classList.add("scrollLogin");
                $i("link-settings").classList.add("active");
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
    }));

    window.addEventListener("resize", resizeScreen);
    window.addEventListener("orientationchange", resizeScreen);

    initSettings();

    // web worker
    if (navigator.serviceWorker) {
        // The website receives hundreds of requests per second from time to time,
        // and this might be caused by an erroneous service worker configuration.
        // Disabling for now.
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for(let reg of registrations) {
                reg.unregister();
            }
        });
        
        /*
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
        });*/
    }

    init();
}

function initSettings() {
    // open popup
    $i("login").addEventListener("click", () => {
        showPwForm();
    });

    // logging out
    $i("logout").addEventListener("click", () => {
        Cookies.remove("username");
        Cookies.remove("apiToken");
        window.localStorage.removeItem("api");
        postLogout();
    });

    // logging in
    $i("login-form").addEventListener("submit", async ev => {
        $i("invalid-login").style.display = "none";
        $i("login-submit").style.display = "none";
        let spinner = $s("#button-spinner img");
        spinner.style.display = "inline";
        ev.preventDefault();
        let authReq = await fetch("/auth", {
            method: "post",
            body: `user=${$i("login-user").value}&pass=${$i("login-pw").value}`
        });
        if (authReq.status == 401) {
            // Unsuccessful authentication
            $i("invalid-login").style.display = "block";
            $i("login-submit").style.display = "inline";
            spinner.style.display = "none";
            return;
        }
        let token = await authReq.text();
        if (!token) return;
        window.localStorage.setItem("api", JSON.stringify({username: $i("login-user").value, token: token}));
        Cookies.set("username", $i("login-user").value, {expires: 60, path: ""});
        Cookies.set("apiToken", token, {expires: 60, path: ""});
        postLogin();
        init(); // resources will be different when logged in
        $i("link-timetable").click();
        $i("margin-details").classList.remove("visible");
    });
}

function initStyles() {
    // initialize styles
    $i("stylepicker").innerHTML = "";
    let svgContent = new XMLSerializer().serializeToString($i("styleprevsvg").getSVGDocument());
    const cancelledLessons = [["AM", "04 Hu"], ["P", "51 Cp"], ["SP", "35 Mo"], ["M", "14 Hu"], ["G", "1C Gn"], ["L", "1G Sc"], ["AM", "18 Ke"], ["GG", "67 Hf"], ["C", "C2 Vz"]];
    const nonCancelledLessons = [["E", "1C Cj"], ["M", "68 Mz"], ["MU", "64 Sn"], ["INS", "I1 Rt"], ["B", "B3 Ha"], ["L", "24 Sk"], ["EWR", "52 Bd"], ["M", "28 Dr"], ["G", "32 Wr"]];
    for (let style in avStyles) {
        let randomCancelled = Math.floor(Math.random() * cancelledLessons.length);
        let randomNonCancelled = Math.floor(Math.random() * nonCancelledLessons.length);
        $i("stylepicker").innerHTML += `
        <div class="stylepreview_cont">
            <span class="style_name">${style}</span>
            ${svgContent
                .replace("$LES1S$", cancelledLessons[randomCancelled][0]).replace("$LES1T$", cancelledLessons[randomCancelled][1])
                .replace("$LES2S$", nonCancelledLessons[randomNonCancelled][0]).replace("$LES2T$", nonCancelledLessons[randomNonCancelled][1])
            }
        </div>`;
    }
    // temporary "in progress" message
    $i("stylepicker").innerHTML += `<div style="display: inline-block;"><span class="style_name">Weitere in Entwicklung...</span><div style="display: inline-block; height: 12.5vh;"></div></div>`;
    let previewers = [];
    for (let i = 0; i < Object.keys(avStyles).length; i++) {
        let el = $c("stylepreview_cont")[i];
        previewers.push(el);
        let style = Object.keys(avStyles)[i];
        for (let prop in avStyles[style]) {
            el.style.setProperty("--sp_" + prop, avStyles[style][prop]);
        }
        if (style == currStyleName) {
            el.classList.add("selected");
        }
        el.addEventListener("click", () => {
            for (let pv of previewers) {
                pv.classList.remove("selected");
            }
            let currentStyle = {
                name: style,
                data: avStyles[style]
            };
            el.classList.add("selected");
            applyStyle(currentStyle);
            gtag("event", "applyNewStyle");
        });
    }
}

async function init() {
    hideError();
    progress(10);
    enableDisableSemButton();
    $s("#timetable tbody").innerHTML = "";
    let classes;
    try {
        let timeReq = await fetch(`/resources/${currTime}`);
        classes = await timeReq.json();
        if (classes.status != "ok") {
            console.warn("Resources returned " + classes.status);
            if (classes.status == "intranet_offline_nocache") throw classes.status;
        }
        classes = classes.data;
    } catch (e) {
        if (e.name != "AbortError") {
            console.error(`Error loading /resources/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
            "Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.");
        }
        progress(100);
        return;
    };
    if (classes.offline) {
        $i("current-class").innerText = "Offline";
        progress(100);
        return;
    }
    progress(20);
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
    showDetails();
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
    window.localStorage.setItem(searchHistoryName, JSON.stringify(searches));
    classID = parseInt(classID.substr(1));
    $i("class-select").value = "";
    gtag("event", "searchResClick");
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

async function loadClass(startAtZero) {
    if (!classList || classList.length == 0) {
        init();
        return;
    }
    gtag("event", "loadClass");
    hideError();
    if (startAtZero) progress(10);
    if (canUseAbortController) {
        classLoadingController.abort();
        classLoadingController = new AbortController();
        classLoadingSignal = classLoadingController.signal;
    }
    $s("#timetable tbody").innerHTML = "";
    let perID;
    try {
        let periodReq = await fetch(`/period-from-time/${currTime}`, {
            signal: classLoadingSignal
        });
        perID = await periodReq.json();
    } catch (e) {
        if (e.name !== "AbortError") {
            console.error(`Error loading /period-from-time/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast.");
            progress(100);
        }
    }
    progress(30);
    if (parseInt(perID) >= 73 && parseInt(perID) <= 76) {
        times = timesPost73;
        shortTimes = shortTimesPost73;
    } else {
        times = timesPre73Post76;
        shortTimes = shortTimesPre73Post76;
    }
    if (parseInt(perID) != currPeriod) {
        currPeriod = parseInt(perID);
        loadSearchHistory();
        init();
        return;
    }
    let ttData;
    let shouldShow = true;
    try {
        let ttReq = await fetch(`/timetable/${IDType}/${classID}/${currTime}`, {
            signal: classLoadingSignal
        });
        progress(50);
        ttData = await ttReq.json();
        if (ttData.status == "intranet_offline_nocache") {
            displayError("TAM-Intranet offline", "Das TAM-Intranet ist momentan leider offline, und dieser Stundenplan wurde nie auf dem Server abgespeichert. " +
            "Versuche es später wieder.");
            progress(100);
            return;
        } else if (ttData.status == "intranet_offline") {
            shouldShow = false;
            let time = new Date(ttData.time);
            displayError("TAM-Intranet offline", "Das TAM-Intranet ist momentan leider offline. Klicke <a href='#' id='view-cached'>hier</a>," +
            ` um die zuletzt geladene Version dieses Studenplans anschauen (Stand: ${time.toLocaleTimeString([], {
                year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
            })})`);
            progress(100);
            $i("view-cached").addEventListener("click", () => {
                hideError();
                $s("#timetable tbody").innerHTML = timetableHTML(timetableData);
                applyScrolling();
            });
        }
        ttData = ttData.data;
    } catch (e) {
        if (e.name !== "AbortError") {
            console.error(`Error loading /timetable/${IDType}/${classID}/${currTime}`);
            displayError("Netzwerkfehler", "Beim Laden des Studenplans ist etwas schiefgelaufen. Stelle sicher, dass du eine Internetverbindung hast. " +
            "Andernfalls ist vermutlich das <a href='https://intranet.tam.ch/kzo/'>TAM-Intranet</a> momentan nicht erreichbar.");
            progress(100);
        }
    }
    if (ttData.error) {
        displayError("TAM-Fehler", ttData.data);
        progress(100);
        return;
    }
    if (IDType == "class") {
        for (let i = 0; i < classList.length; i++) {
            if (!classList[i].classId) break;
            if (classList[i].classId == classID) {
                currClassName = classList[i].className.replace(' ', '');
            }
        }
    } else if (IDType == "student") {
        currClassName = idToName(classID) + " (" + classFromTTData(ttData).replace(/ /g, '') + ")";
    }
    // if the user hasn't clicked away yet
    if (currentView == 0) {
        $i("current-class").innerText = currClassName;
    }
    progress(60);
    timetableData = convertToUsable(ttData);
    
    if (shouldShow) {
        $s("#timetable tbody").innerHTML = timetableHTML(timetableData);
        applyScrolling();
    }

    progress(100);
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

function loadStyles() {
    $i("styleprevsvg").style.display = "none";
    fetch("/styles/").then(res => res.json()).then(r => {
        avStyles = r;
        initStyles();
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
        timeout = true;
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

function loadSearchHistory() {
    searchHistoryName = "search-history" + currPeriod;
    searches = [];
    if (window.localStorage.getItem(searchHistoryName)) {
        try {
            searches = JSON.parse(window.localStorage.getItem(searchHistoryName));
        } catch (e) {}
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
                    html += `<span class="student studentName person-link" data="${r.id}">${r.name}</span>`
                }
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
                    lengthName = "fullday"
                }
                mainDivHTML += `<td rowspan=${lLength} class="timetable-entry ${isSpecial}" data="${day + ";" + i}"><div class="sc_cont"><div class="scroller-container ${lengthName}"><div class="scroller">${lessons}<div class="addScroller"></div></div></div></div></td>`;
            }
        }
        mainDivHTML += `</tr>`;
    }
    return mainDivHTML;
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
    let input = $i("class-select").value.toLowerCase().replace(' ', '');
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
    $i("timetable").style.display = "none";
}

function hideError() {
    $i("error-timetable").classList.remove("visible");
    $i("timetable").style.display = "table";
}

function postLogin() {
    $i("invalid-login").style.display = "none";
    fetch("/myData").then(res => res.json()).then(res => {
        if (res.total > 0) {
            persData = res.data[0];
            $i("ownName").innerText = persData.Vorname + " " + persData.Nachname;
            $i("otherDetails").innerText = persData.Adresse + ", " + persData.PLZ + " " + persData.Ort;
            $i("login-form").style.display = "none";
            $i("accountinfo").style.display = "inline";
            $s("#panel-settings h2").innerText = "Account";
            $i("login").style.display = "none";
            $i("persDetails").style.display = "";
        }
    });
}

function postLogout() {
    $i("invalid-login").style.display = "none";
    $s("#panel-settings h2").innerText = "Account (nicht angemeldet)";
    $i("login").style.display = "inline";
    $i("accountinfo").style.display = "none";
}

function showPwForm() {
    $i("details_cont").style.display = "none";
    $i("login-window").style.display = "inline";
    $i("margin-details").classList.add("visible");
}

function showDetails(html) {
    if (html) {
        $i("detail-view").innerHTML = html;
    }
    $i("details_cont").style.display = "";
    $i("login-window").style.display = "none";
    $i("margin-details").classList.add("visible");
}

function applyStyle(style) {
    window.localStorage.setItem("style", JSON.stringify(style));
    for (let prop in style.data) {
        document.documentElement.style.setProperty("--" + prop, style.data[prop]);
    }
}
