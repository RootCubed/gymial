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
        $i("panels").className = "scrollable";
        $i("current-class").classList.add("noclick");
        $c("sidebar-link").forEach(el => el.classList.remove("active"));
        overrideTitle(el.target.innerText);
        switch(el.target.innerText) {
            case VIEW_NAMES[0]:
                overrideTitle(gymial.tt.getClassName());
                $i("panels").classList.add("scrollTimetable");
                $i("link-timetable").classList.add("active");
                $i("week-btns").classList.remove("hide");
                $i("current-class").classList.remove("noclick");
                currentView = 0;
                break;
            case VIEW_NAMES[1]:
                $i("panels").classList.add("scrollLogin");
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
                $i("panels").classList.add("scrollMensa");
                $i("link-mensa").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 2;
                break;
            case VIEW_NAMES[3]:
                $i("panels").classList.add("scrollGrades");
                $i("link-grades").classList.add("active");
                $i("week-btns").classList.add("hide");
                currentView = 3;
                break;
        }
        $i("sidebar").classList.remove("visible");
        setTimeout(() => $i("panels").classList.remove("scrollable"), 500);
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
    let resultHTML = "";
    if (input.length < 1) {
        for (let search of gymial.store.getSearchHistory()) {
            resultHTML += `<span class="search-result" data="${search.id}">${search.name}</span>`;
        }
    } else {
        let filtered = gymial.tt.getCurrResources().filter(val => {
            if (val.className) {
                return val.className.toLowerCase().replace(' ', '').includes(input);
            } else if (val.room) {
                return val.room.toLowerCase().includes(input);
            } else {
                return val.name.toLowerCase().includes(input);
            }
        });
        for (let found of filtered) {
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
    }
    $i("search-results").innerHTML = resultHTML;
    $c("search-result").forEach(sr => sr.addEventListener("click", el => {
        let name = el.target.innerText;
        let entityID = el.target.getAttribute("data");
        let entityType = {
            'c': "class",
            't': "teacher",
            's': "student",
            'r': "room"
        }[entityID[0]];
        clickSearchResult(name, entityType, entityID);
    }));
}

function clickSearchResult(name, entityType, entityID) {
    gtag("event", "searchResClick");

    gymial.store.pushSearch(name, entityID);

    $i("class-select").value = "";

    let trueID = parseInt(entityID.substr(1));
    if (entityType == "student") {
        gymial.tt.setSelectedPerson(name);
    } else {
        gymial.tt.setClassName(name);
    }
    gymial.tt.loadTTData(entityType, trueID, gymial.tt.getCurrTime(), gymial.tt.getCurrResources());
}