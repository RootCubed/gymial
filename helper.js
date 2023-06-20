import hyphenopoly from "hyphenopoly";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const hyphenator = hyphenopoly.config({
    "require": ["de", "en-us"],
    "hyphen": "•",
    "loaderSync": file => {
        const cwd = dirname(fileURLToPath(import.meta.url));
        return fs.readFileSync(`${cwd}/node_modules/hyphenopoly/patterns/${file}`);
    },
    "sync": true
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
        if (parseInt(classID) >= period.lowestClass) {
            currPeriod = period;
            break;
        }
    }
    return currPeriod;
}