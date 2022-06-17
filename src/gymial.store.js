import * as gymial from "./gymial.module.js";

let currStyleName = "Classic Dark";
let searchHistory, searchHistoryName;
let username, apiToken;

// TODO: move code in init() into respective modules

export function init() {
    try {
        let json = JSON.parse(window.localStorage.getItem("api"));
        setAPIKey(json.username, json.token);
    } catch (e) {}
    
    try {
        let currentStyle = JSON.parse(window.localStorage.getItem("style"));
        currStyleName = currentStyle.name;
        gymial.style.applyStyle(currentStyle);
    } catch (e) {}

    if (gymial.tt.isNextSemOnline() && window.localStorage) {
        let shouldShowHint = false;
        if (window.localStorage.getItem("seenNextSemHint")) {
            if (window.localStorage.getItem("seenNextSemHint") < gymial.tt.getCurrPeriod()) shouldShowHint = true;
        } else {
            shouldShowHint = true;
        }
        window.localStorage.setItem("seenNextSemHint", gymial.tt.getCurrPeriod());
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

export function getLoadedClass() {
    try {
        let json = JSON.parse(window.localStorage.getItem("class"));
        return {
            id: json.id,
            name: json.name
        };
    } catch (e) {
        return null;
    }
}

export function setLoadedClass(id, name) {
    window.localStorage.setItem("class", JSON.stringify({id: id, name: name}));
}

export function setAPIKey(username, token) {
    window.localStorage.setItem("api", JSON.stringify({username: username, token: token}));
    Cookies.set("username", username, {expires: 365});
    Cookies.set("apiToken", token, {expires: 365});
}

export function getStyleName() {
    return currStyleName;
}

export function setStyle(styleData) {
    window.localStorage.setItem("style", JSON.stringify(styleData));
}

export function getSearchHistory() {
    return searchHistory;
}

export function pushSearch(name, id) {
    searchHistory.unshift({
        id: id,
        name: name,
        auth: true
    });

    // get rid of duplicated entries, removing all but the first occurrence
    searchHistory = searchHistory.filter((v, i, a) => {
        return a.findIndex(t => (t.id === v.id && t.name === v.name)) === i;
    });
    searchHistory = searchHistory.slice(0, 7); // max 7 search results
    window.localStorage.setItem(searchHistoryName, JSON.stringify(searchHistory));
}

export function getGradeData() {
    try {
        let json = JSON.parse(window.localStorage.getItem("grades"));
        if (json == null) return {};
        return json;
    } catch (e) {
        return {};
    }
}

export function setGradeData(data) {
    window.localStorage.setItem("grades", JSON.stringify(data));
    window.localStorage.setItem("grades_mod_ts", Date.now());
}

export function getGradeLastMod() {
    let r = window.localStorage.getItem("grades_mod_ts");
    return (r != undefined) ? parseInt(r) : 0;
}

export function getGradeSyncMode() {
    let r = window.localStorage.getItem("grades_sync_mode");
    return (r != undefined) ? r : "auto";
}

export function setGradeSyncMode(mode) {
    window.localStorage.setItem("grades_sync_mode", mode);
}