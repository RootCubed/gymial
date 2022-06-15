import nodeFetch from "node-fetch";
import https from "https";
import iconv from "iconv-lite";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { JSDOM } from "jsdom";

import * as helper from "./helper.js";

const limiterIntranetLogin = new RateLimiterMemory({
    points: 30,
    duration: 60,
    blockDuration: 60
});

const limiterKZOch = new RateLimiterMemory({
    points: 30,
    duration: 60,
    blockDuration: 60
});

const limiterIntranetReq = new RateLimiterMemory({
    points: 120,
    duration: 60,
    blockDuration: 30
});

let cookies = {
    tamIntranet: null,
    tamIntranetCSRF: "",
    kzoIntranet: null
};

let headers = {
    "Connection": "keep-alive",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Origin": "https://intranet.tam.ch",
    "X-Requested-With": "XMLHttpRequest",
    "Accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "User-Agent": "Node.js application",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Host": "intranet.tam.ch",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Referer": "https://intranet.tam.ch/kzo",
    "Cookie": `username=${process.env.user}; school=kzo; sturmuser=${process.env.user}; sturmsession=`
};

function tamLogin(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            await limiterIntranetLogin.consume();
        } catch (e) {
            reject(new Error("ratelimit"));
        }
        let body = {
            loginuser: username,
            loginpassword: password,
            loginschool: "kzo"
        };

        let options = {
            hostname: "intranet.tam.ch",
            port: 443,
            path: "/kzo/",
            method: "POST",
            headers: JSON.parse(JSON.stringify(headers)),
            referrerPolicy: "strict-origin-when-cross-origin",
            timeout: 5000
        };

        options.headers.Cookie = null;
    
        let req = https.request(options, res => {
            let setCookies = res.headers["set-cookie"];
            let sturmsession;
            let str = "";
            let newCookies = "";
            if (setCookies) {
                for (let c of setCookies) {
                    newCookies += c.split(";")[0] + "; ";
                    sturmsession = c.match(/sturmsession=[0-9a-z]+/);
                }
            }
            if (!sturmsession) reject(new Error("invalidlogin"));
            options.path = "/kzo/list/get-person-detail-list/list/30/id/0/noListData/1/selector/config-list-edit";
            options.headers.Cookie = newCookies;
            options.method = "GET";
            let req2 = https.request(options, res => {
                res.on("data", d => {
                    str += d.toString();
                });
                res.on("end", () => {
                    let user = {data: []};
                    try {
                        user = {data: [JSON.parse(str.match(/personData ?= ?\[([^\]]+)\],/)[1])], total: 1};
                    } catch (err) {}
                    resolve([sturmsession, user]);
                });
            });
            req2.end();
        });

        req.on("timeout", () => {
            req.destroy();
            reject(new Error("timeout"));
        });
    
        req.write(new URLSearchParams(body).toString());
        req.end();
    });
}

function objToCookie(obj) {
    let res = "";
    for (let el in obj) {
        res += el + "=" + obj[el] + ";";
    }
    return res;
}

function intranetReq(endpoint, body, canRetryLogin) {
    let options = {
        hostname: "intranet.tam.ch",
        port: 443,
        path: endpoint,
        method: "POST",
        headers: JSON.parse(JSON.stringify(headers)),
        referrerPolicy: "strict-origin-when-cross-origin",
        timeout: 5000,
        referrer: "https://intranet.tam.ch/kzo/"
    };
    if (body.periodId != helper.getPeriod(new Date().getTime())) {
        options.referrer = "https://intranet.tam.ch/kzo/calendar/index/period/" + body.periodId;
        options.headers.Referer = "https://intranet.tam.ch/kzo/calendar/index/period/" + body.periodId;
    }
    body.csrfToken = cookies.tamIntranetCSRF;
    return new Promise(async (resolve, reject) => {
        try {
            await limiterIntranetReq.consume();
        } catch (e) {
            reject(new Error("ratelimit"));
        }
        let str = "";

        let req = https.request(options, res => {
            res.on("data", d => {
                str += d.toString();
            });
            res.on("end", () => {
                if (str[0] === "<" || str.length == 0) { // invalid session
                    if (canRetryLogin === false) {
                        reject(new Error("successful_login_invalid_result"));
                        return;
                    }
                    console.log("logging in...");
                    tamLogin(process.env.user, process.env.password).then((sessionToken) => {
                        if (sessionToken != null) {
                            let token = sessionToken[0];
                            headers.Cookie = `username=${process.env.user}; school=kzo; sturmuser=${process.env.user}; ` + token;
                        }
                        nodeFetch("https://intranet.tam.ch/kzo", {headers: headers}).then(r => r.text()).then(r => {
                            cookies.tamIntranetCSRF = r.match(/csrfToken ?= ?'([0-z]+)/)[1];
                            intranetReq(endpoint, body, false).then(r => {
                                resolve(r);
                            }).catch(err => {
                                reject(err);
                            });
                        });
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    resolve(str);
                }
            });
        });

        req.on("timeout", () => {
            req.destroy();
            reject(new Error("timeout"));
        });
        
        req.on("error", err => {
            reject(err);
        });
    
        req.write(new URLSearchParams(body).toString());
        req.end();
    });
}

async function loginRegularKZO(user, pass) {
    let res = await nodeFetch("https://intranet.kzo.ch/index.php?id=intranet", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
            "pragma": "no-cache",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        "referrer": "https://www.kzo.ch/index.php?id=intranet",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": `user=${user}&pass=${pass}&submit=Anmelden&logintype=login&pid=712`,
        "method": "POST",
        "mode": "cors"
    });
    let setCookies = res.headers.raw()["set-cookie"];
    if (!setCookies) throw new Error("kzoch_down");
    cookies.kzoIntranet = {};
    for (let c of setCookies) {
        let tmp = c.split("=");
        cookies.kzoIntranet[tmp[0]] = tmp[1].split("; ")[0];
    }
}

async function searchPeopleKZOch(firstName, lastName, classToSearch) {
    try {
        await limiterKZOch.consume("");
    } catch (e) {
        reject(new Error("ratelimit"));
        return;
    }
    if (!cookies.kzoIntranet || !cookies.kzoIntranet.PHPSESSID) {
        try {
            await loginRegularKZO(process.env.user, process.env.password);
        } catch (e) {
            reject(e);
            return;
        }
    }
    const res = await nodeFetch("https://intranet.kzo.ch/index.php?id=549", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
            "accept-charset": "utf-8;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
            "pragma": "no-cache",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": objToCookie(cookies.kzoIntranet)
        },
        "referrer": "https://intranet.kzo.ch/index.php?id=549",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": `vorname=${firstName}&nachname=${lastName}&klasse=${classToSearch}&search=%3E%3E+suchen`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    const data = iconv.decode(Buffer.from(await res.arrayBuffer()), "iso-8859-1"); // bruh why does kzo.ch use ancient charsets, please just start using utf-8
    if (data.includes("Keine Adressen gefunden")) resolve([]);
    let table = data.match(/<table.*?adressliste">(.|\s)+?<\/table>/g)[0];
    let rows = table.match(/<tr.*?>(.|\s)+?<\/tr>/g);
    let json = [];
    for (let i = 1; i < rows.length; i++) { // skip the header row
        let entries = rows[i].match(/<td.*?>(.|\s)+?<\/td>/g);
        json.push([]);
        for (let e of entries) {
            json[json.length - 1].push(e.replace(/<td.*?>/, '').replace(/<\/td>/, '').replace("&nbsp;", ''));
        }
    }
    return json;
}

async function readMensaData(identifier) {
    let f = await nodeFetch("https://menu.sv-group.ch/typo3conf/ext/netv_svg_menumob/ajax.getContent.php", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
        },
        "body": `action=getMenuplan&params%5Bbranchidentifier%5D=${identifier}`,
        "method": "POST",
        "mode": "cors"
    });
    let json = await f.json();

    const dom = new JSDOM(json[0].html);
    let menu = {};
    let days = dom.window.document.getElementsByClassName("day-tab");
    for (let day of days) {
        let menus = day.getElementsByClassName("details-menu");
        let dayName = day.getElementsByClassName("details-date")[0].textContent;
        dayName = dayName.split(". ").join(".");
        menu[dayName] = [];
        for (let m of menus) {
            let kitchenName = m.getElementsByClassName("details-menu-type")[0].textContent;
            let menuName = m.getElementsByClassName("details-menu-name");
            let menuDescription = m.getElementsByClassName("details-menu-trimmings");

            if (menuName.length == 0) {
                menuName = "";
            } else {
                menuName = menuName[0].textContent;
            }
            if (menuDescription.length == 0) {
                menuDescription = "";
            } else {
                menuDescription = menuDescription[0].textContent;
            }

            // hyphenate
            menuName = helper.hyphenate(menuName, "&shy;");
            menuDescription = helper.hyphenate(menuDescription, "&shy;");

            menu[dayName].push({
                kitchen: kitchenName,
                title: menuName,
                description: menuDescription.replace(/\n/g, ' ').replace(/  /g, ' ')
            });
        }
    }
    return menu;
}

export default {
    tam: {
        request: intranetReq
    },
    kzoch: {
        personSearch: searchPeopleKZOch
    },
    mensa: {
        getData: readMensaData
    }
};