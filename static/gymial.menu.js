import * as gymial from "./gymial.module.js";

import { $s, $i, $c } from "./gymial.helper.js";

let currentView = 0;
const VIEW_NAMES = ["Stundenplan", "Einstellungen", "Mensaplan", "Noten"];

let currMensa = "KZO";

export function init() {
    $i("class-select").addEventListener("focus", filterObjects);
    $i("class-select").addEventListener("keyup", filterObjects);
    
    $i("open-menu").addEventListener("click", toggle);

    // swiping for side panel
    let swipeStartX = 0;
    let swipeStartY = 0;
    let allowSwipe = false;
    document.addEventListener("touchstart", ev => {
        let t = ev.touches[0];
        swipeStartX = t.screenX; 
        swipeStartY = t.screenY;
        allowSwipe = !$i("stylepicker_cont").contains(t.target); // TODO: unhardcode
    });
    document.addEventListener("touchmove", ev => {
        if (!allowSwipe) return;
        var t = ev.touches[0];
        if (Math.abs(swipeStartY - t.screenY) < 20) {
            if (swipeStartX - t.screenX < -50) {
                $i("sidebar").classList.add("visible");
            } else if (swipeStartX - t.screenX > 50) {
                $i("sidebar").classList.remove("visible");
            }
        }
    });

    // sidebar link
    $c("sidebar-link").forEach(el => el.addEventListener("click", el => {
        gymial.detail.hide();
        $i("panel-timetable").className = "canScroll";
        $i("current-class").classList.add("noclick");
        $c("sidebar-link").forEach(el => el.classList.remove("active"));
        overrideTitle(el.target.innerText);
        switch(el.target.innerText) {
            case VIEW_NAMES[0]:
                gymial.tt.setClassName();
                $i("panel-timetable").classList.add("scrollTimetable");
                $i("link-timetable").classList.add("active");
                $i("week-btns").classList.remove("hide");
                $i("current-class").classList.remove("noclick");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $i("panel-timetable").classList.add("scrollLogin");
                $i("link-settings").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 1;
                break;
            case VIEW_NAMES[2]:
                overrideTitle(`${VIEW_NAMES[2]} <span id="toggle-mensa">${currMensa}</span>`);
                $i("toggle-mensa").addEventListener("click", () => {
                    if (currMensa == "KZO") {
                        currMensa = "Schellerstrasse";
                    } else {
                        currMensa = "KZO";
                    }
                    $i("toggle-mensa").innerText = currMensa;
                    gymial.mensa.loadMensa(currMensa, true);
                });
                $i("panel-timetable").classList.add("scrollMensa");
                $i("link-mensa").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 2;
                break;
            case VIEW_NAMES[3]:
                $i("panel-timetable").classList.add("scrollGrades");
                $i("link-grades").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 3;
                break;
        }
        $i("sidebar").classList.remove("visible");
        setTimeout(() => $i("panel-timetable").classList.remove("canScroll"), 500);
    }));
}

function toggle() {
    $i("sidebar").classList.toggle("visible");
}

export function show() {
    $i("sidebar").classList.add("visible");
}

export function hide() {
    $i("sidebar").classList.remove("visible");
}

export function hideSearchResults() {
    $i("search-results").innerHTML = "";
}

export function getCurrentView() {
    return currentView;
}

export function setProgress(number) {
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

export function overrideTitle(html) {
    $i("current-class").innerHTML = html;
}

function filterObjects() {
    let input = $i("class-select").value.toLowerCase().replace(' ', '');
    $i("search-results").innerHTML = "";
    if (input.length < 1) {
        for (let search of searches) {
            $i("search-results").innerHTML += `<span class="search-result" data="${search.id}">${search.name}</span>`;
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
            resultHTML += `<span class="search-result" data="c${found.classId}">${found.className.replace(' ', '')}</span>`;
        } else if (found.acronym) {
            resultHTML += `<span class="search-result" data="t${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`;
        } else if (found.room) {
            resultHTML += `<span class="search-result" data="r${found.roomId}">${found.room}</span>`;
        } else {
            resultHTML += `<span class="search-result" data="s${found.personId}">${found.name.replace(/\(.+?\)/, '')}</span>`;
        }
    }
    $i("search-results").innerHTML = resultHTML;
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