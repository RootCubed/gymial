import hyphenopoly from "hyphenopoly";
import fs from "fs";

const hyphenator = await hyphenopoly.config({
    "require": ["de", "en-us"],
    "hyphen": "•"
}).get("de");

export const hyphenate = (str, token) => hyphenator(str).replace(/•/g, token);

export const periods = fs.readFileSync("period_list.txt", "utf-8").replace(/\r/g, "").split("\n").map(e => ({
    period: parseInt(e.split("|")[0]),
    startTime: parseInt(e.split("|")[1]),
    lowestClass: parseInt(e.split("|")[2])
}));

export function getPeriod(time) {
    let currPeriod;
    for (let period of periods) {
        if (time >= period.startTime) {
            currPeriod = period.period;
            break;
        }
    }
    return currPeriod;
}

export function getPeriodFromClass(classID) {
    let currPeriod;
    for (let period of periods) {
        console.log(classID, period.lowestClass);
        if (parseInt(classID) >= period.lowestClass) {
            currPeriod = period;
            break;
        }
    }
    return currPeriod;
}