import * as gymial from "./gymial.module.js";

let currStyleName;
let searchHistory, searchHistoryName;
let username, apiToken;

export function init(currPeriod) {
    try {
        let json = JSON.parse(window.localStorage.getItem("api"));
        setAPIKey(json.username, json.token);
    } catch (e) {}
    
    try {
        let json = JSON.parse(window.localStorage.getItem("class"));
        gymial.tt.setClass(json.id);
        gymial.menu.overrideTitle(json.name);
    } catch (e) {}
    
    try {
        let currentStyle = JSON.parse(window.localStorage.getItem("style"));
        gymial.style.applyStyle(currentStyle);
        currStyleName = currentStyle.name;
    } catch (e) {}

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

    loadSearchHistory(gymial.tt.getCurrPeriod());
}

export function loadSearchHistory(period) {
    searchHistoryName = "search-history" + period;
    searchHistory = [];
    if (window.localStorage.getItem(searchHistoryName)) {
        try {
            searchHistory = JSON.parse(window.localStorage.getItem(searchHistoryName));
        } catch (e) {}
    }
}

export function setAPIKey(username, token) {
    window.localStorage.setItem("api", JSON.stringify({username: username, token: token}));
    Cookies.set("username",  json.username, {expires: 365});
    Cookies.set("apiToken",  json.token, {expires: 365});
}

export function setStyle(styleData) {
    window.localStorage.setItem("style", JSON.stringify(styleData));
}

export function getSearchHistory() {
    return searchHistory;
}