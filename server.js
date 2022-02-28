import querystring from "querystring";
import https from "https";
import express from "express";
const app = express();
import nodeFetch from "node-fetch";
import cors from "cors";
import crypto from "crypto";
import compression from"compression";
import minify from "express-minify";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";

const rtg = new URL(process.env.REDISTOGO_URL);
import redisModule from "redis";
const redis = redisModule.createClient(rtg.port, rtg.hostname);
redis.auth(rtg.password);
import { promisify } from "util";
const redisHGet = promisify(redis.hget).bind(redis);

app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https" && req.hostname !== "localhost" && !req.hostname.includes("192.168") && !req.hostname.includes("rootcubed.dev")) {
        res.redirect(301, `https://${req.header("host")}${req.url}`);
    } else {
        if (req.headers.cookie) {
            let user = cookieToUser(req.headers.cookie);
            isAuthorized(user).then(isAuth => {
                if (isAuth) {
                    redis.hincrby("user:" + user.username, "requests", 1);
                } else {
                    redis.incr("nonAuthReqs");
                }
            });
        }
        next();
    }
});

app.use(cors());
app.use(compression());
app.use(minify({
    jsMatch: /javascript/,
    cssMatch: /css/,
    jsonMatch: false
}));
app.use(express.static("static"));

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

let kzoCHCookies = {};

const PORT = process.env.PORT || 3000;

let token = "";

const periods = [
    {
        "period": 76,
        "startTime": 1646002800000
    },
    {
        "period": 75,
        "startTime": 1629752236880
    },
    {
        "period": 74,
        "startTime": 1614553200000
    },
    {
        "period": 73,
        "startTime": 1597615200000
    },
    {
        "period": 72,
        "startTime": 1582498800000
    },
    {
        "period": 71,
        "startTime": 0
    }
];
function generateAPIKey() {
    return crypto.randomBytes(16).toString("hex");
}

function login(username, password) {
    return new Promise((resolve) => {
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
            referrerPolicy: "strict-origin-when-cross-origin"
        };

        options.headers["Cookie"] = null;
    
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
            if (!sturmsession) resolve();
            options.path = "/kzo/list/get-person-detail-list/list/30/id/0/noListData/1/selector/config-list-edit";
            options.headers["Cookie"] = newCookies;
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
    
        req.write(querystring.stringify(body));
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

function loginRegularKZO(user, pass) {
    return new Promise((resolve, reject) => {
        nodeFetch("https://intranet.kzo.ch/index.php?id=intranet", {
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
        }).then(res => {
            let setCookies = res.headers.raw()["set-cookie"];
            kzoCHCookies = {};
            if (setCookies) {
                for (let c of setCookies) {
                    let tmp = c.split("=");
                    kzoCHCookies[tmp[0]] = tmp[1].split("; ")[0];
                }
                resolve();
            }
            reject();
        });
    });
}

function searchPeopleKzoCH(firstName, lastName, classToSearch) {
    return new Promise(async (resolve) => {
        if (!kzoCHCookies.PHPSESSID) {
            await loginRegularKZO(process.env.user, process.env.password);
        }
        nodeFetch("https://intranet.kzo.ch/index.php?id=549", {
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
                "cookie": objToCookie(kzoCHCookies)
            },
            "referrer": "https://intranet.kzo.ch/index.php?id=549",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": `vorname=${firstName}&nachname=${lastName}&klasse=${classToSearch}&search=%3E%3E+suchen`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.buffer()).then(res => {
            res = iconv.decode(Buffer.from(res), "iso-8859-1"); // bruh why does kzo.ch use ancient charsets, please just start using utf-8
            if (res.includes("Keine Adressen gefunden")) resolve([]);
            let table = res.match(/<table.*?adressliste">(.|\s)+?<\/table>/g)[0];
            let rows = table.match(/<tr.*?>(.|\s)+?<\/tr>/g);
            let json = [];
            for (let i = 1; i < rows.length; i++) { // skip the header row
                let entries = rows[i].match(/<td.*?>(.|\s)+?<\/td>/g);
                json.push([]);
                for (let e of entries) {
                    json[json.length - 1].push(e.replace(/<td.*?>/, '').replace(/<\/td>/, '').replace("&nbsp;", ''));
                }
            }
            resolve(json)
        });
    });
}

function intranetReq(endpoint, body) {
    let options = {
        hostname: "intranet.tam.ch",
        port: 443,
        path: endpoint,
        method: "POST",
        headers: JSON.parse(JSON.stringify(headers)),
        referrerPolicy: "strict-origin-when-cross-origin"
    };
    if (body.periodId == periods[0].period) {
        options.referrer = "https://intranet.tam.ch/kzo/calendar/index/period/" + body.periodId;
        options.headers.Referer = "https://intranet.tam.ch/kzo/calendar/index/period/" + body.periodId;
    }
    body.csrfToken = token;
    return new Promise(function(resolve) {
        let str = "";

        let req = https.request(options, res => {
            res.on("data", d => {
                str += d.toString();
            });
            res.on("end", () => {
                if (str[0] === "<" || str.length == 0) { // invalid session
                    console.log("logging in...");
                    login(process.env.user, process.env.password).then((sessionToken) => {
                        if (sessionToken != null) {
                            let token = sessionToken[0];
                            headers["Cookie"] = `username=${process.env.user}; school=kzo; sturmuser=${process.env.user}; ` + token;
                        }
                        nodeFetch("https://intranet.tam.ch/kzo", {headers: headers}).then(r => r.text()).then(r => {
                            token = r.match(/csrfToken ?= ?'([0-z]+)/)[1];
                            intranetReq(endpoint, body).then(r => {
                                resolve(r);
                            });
                        });
                    });
                } else {
                    resolve(str);
                }
            });
        });
    
        req.write(querystring.stringify(body));
        req.end();
    });
}

async function verifyAuthentication(username, password) {
    let token = await login(username, password);
    if (!token) return false;
    redis.hset("user:" + username, "persData", JSON.stringify(token[1]));
    return true;
}

function getPeriod(time) {
    let currPeriod;
    for (let period of periods) {
        if (time >= period.startTime) {
            currPeriod = period.period;
            break;
        }
    }
    return currPeriod;
}

function cookieToUser(cookie) {
    if (!cookie) return {};
    let splitCookie = cookie.replace(/ /g, '').split(";");
    let cookies = {};
    for (let value of splitCookie) {
        if (value.split('=').length == 2) {
            cookies[value.split('=')[0]] = value.split('=')[1];
        }
    }
    if (!cookies.username) return cookies;
    cookies.username = toStandardFormat(cookies.username);
    return cookies;
}

async function isAuthorized(user) {
    if (!user) return false;
    if (!user.username || !user.apiToken) return false;
    let correctAPIToken = await redisHGet("user:" + user.username, "token");
    if (correctAPIToken == null) return false;
    return (user.apiToken == correctAPIToken);
}

function toStandardFormat (token) {
    return token.toLowerCase().replace(/\@studmail.kzo.ch/g, "").trim();
}

app.post("/auth", function (req, res) {
    var body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", () => {
        let bodySplitted = body.split('&');
        let bodyJSON = {};
        for (let arg of bodySplitted) {
            bodyJSON[arg.split('=')[0]] = arg.split('=')[1];
        }
        if (bodyJSON.user && bodyJSON.pass) {
            bodyJSON.user = toStandardFormat(bodyJSON.user);
            verifyAuthentication(bodyJSON.user, bodyJSON.pass).then(r => {
                if (r) {
                    let token = generateAPIKey();
                    redis.hset("user:" + bodyJSON.user, "token", token);
                    redis.hget("user:" + bodyJSON.user, "requests", (err, res) => {
                        if (res == null) redis.hset("user:" + bodyJSON.user, "requests", 0);
                    });
                    res.send(token).end();
                } else {
                    res.status(401).end();
                }
            });
        }
    });
});

app.get("/myData", function (req, res) {
    let user = cookieToUser(req.headers.cookie);
    isAuthorized(user).then(isAuth => {
        if (!isAuth) {
            res.send({
                data: [],
                total: 0
            });
            return;
        }
        redis.hget("user:" + user.username, "persData", (err, r) => {
            if (r == null) {
                res.send({
                    data: [],
                    total: 0
                });
                return;
            }
            res.send(JSON.parse(r));
        });
    });
});

app.get("/timetable/:type/:id/:time", function (req, res) {
    let body = {
        "startDate": req.params.time,
        "endDate": parseInt(req.params.time) + 4 * 24 * 60 * 60 * 1000,
        "holidaysOnly": 0,
        "method": "POST"
    };
    switch (req.params.type) {
        case "class":
        case "teacher":
        case "student":
        case "room":
            break;
        default:
            res.status(400).end();
            return;
    }
    body[req.params.type + "Id[]"] = req.params.id;
    intranetReq("/kzo/timetable/ajax-get-timetable", body).then(r => {
        isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
            let json = JSON.parse(r);
            if (json.status != 1) {
                res.send({"error": json.message});
                return;
            }
            if (!isAuth) {
                const propsToKeep = [
                    "id", "periodId", "start", "end", "lessonDate", "lessonStart", "lessonEnd", "lessonDuration",
                    "timetableEntryTypeId", "timetableEntryType", "timetableEntryTypeLong", "timetableEntryTypeShort",
                    "title", "courseId", "courseName", "course", "subjectName", "classId", "className", "teacherAcronym",
                    "roomId", "roomName", "teacherId", "isAllDay"
                ]
                let basicJSON = new Array(json.data.length);
                for (let i = 0; i < json.data.length; i++) {
                    basicJSON[i] = {};
                    for (let p of propsToKeep) {
                        basicJSON[i][p] = json.data[i][p];
                    }
                }
                res.send(basicJSON);
            } else {
                res.send(json.data);
            }
        });
    });
});

app.get("/course-participants/:id", function (req, res) {
    isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
        if (!isAuth) {
            res.status(401).end();
            return;
        }
        let body = {
            "method": "GET"
        };
        intranetReq(`/kzo/list/getlist/list/40/id/${req.params.id}/period/73`, body).then(r => {
            res.send(JSON.parse(r).data.map(el => {
                return {
                    "name": el.Name + ", " + el.Vorname,
                    "id": el.PersonID
                };
            }));
        });
    });
});

app.get("/resources/:time", function (req, res) {
    let body = {
        "periodId": getPeriod(req.params.time),
        "method": "POST"
    };
    intranetReq("/kzo/timetable/ajax-get-resources/", body).then(r => {
        isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
            if (!isAuth) {
                res.send({
                    "offline": false,
                    "data": JSON.parse(r).data.classes
                });
                return;
            }
            res.send({
                "offline": false,
                "data": [...JSON.parse(r).data.classes, ...JSON.parse(r).data.teachers, ...JSON.parse(r).data.students, ...JSON.parse(r).data.rooms]
            });
        });
    });
});

app.get("/getName/:id", function (req, res) {
    isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
        if (!isAuth) {
            res.status(401).end();
            return;
        }
        let body = {
            "id": req.params.id,
            "method": "POST"
        };
        intranetReq("/kzo/list/get-person-name", body).then((r) => {
            res.send(r);
        });
    });
});

app.get("/search-internal-kzoCH/:firstName/:lastName/:class", function(req, res) {
    isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
        if (!isAuth) {
            res.status(401).end();
            return;
        }
        let fN = "";
        let lN = "";
        let cl = "";
        if (req.params.firstName != "_") fN = req.params.firstName;
        if (req.params.lastName != "_") lN = req.params.lastName;
        if (req.params.class != "_") cl = req.params.class;
        searchPeopleKzoCH(fN, lN, cl).then(r => res.send(r));
    });
});

app.get("/class-personal-details/:classID", function (req, res) {
    isAuthorized(cookieToUser(req.headers.cookie)).then(isAuth => {
        if (!isAuth) {
            res.status(401).end();
            return;
        }
        let startTime = periods[1].startTime;
        if (req.params.classID >= 2564) startTime = periods[0].startTime;
        let body = {
            "startDate": startTime,
            "endDate": startTime + 4 * 24 * 60 * 60 * 1000,
            "holidaysOnly": 0,
            "method": "POST",
            "classId[]": req.params.classID
        };
        intranetReq("/kzo/timetable/ajax-get-timetable", body).then(r => {
            let data = JSON.parse(r).data;
            let potentialClassLists = {};
            for (let d of data) {
                if (d.classId.length == 1) {
                    let studStr = d.student.reduce((a, v) => a + v.studentName + ";", "");
                    if (potentialClassLists[studStr]) {
                        potentialClassLists[studStr].count++;
                    } else {
                        potentialClassLists[studStr] = {
                            count: 0,
                            studentArray: d.student
                        };
                    }
                }
            }
            let best = {count:0};
            for (let d in potentialClassLists) {
                if (potentialClassLists[d].count > best.count) {
                    best = potentialClassLists[d];
                }
            }
            res.send(best.studentArray);
        });
    });
});

app.get("/period-from-time/:time", function (req, res) {
    res.end(getPeriod(req.params.time).toString());
});

let mensaPlanKZO;
let mensaPlanScheller;

app.get("/mensa/KZO", function (req, res) {
    if (mensaPlanKZO) {
        res.send(mensaPlanKZO).end();
        return;
    }
    res.status(404).end();
});

app.get("/mensa/Schellerstrasse", function (req, res) {
    if (mensaPlanScheller) {
        res.send(mensaPlanScheller).end();
        return;
    }
    res.status(404).end();
});

updateMensaCache();
setInterval(updateMensaCache, 1000 * 60 * 60);

async function updateMensaCache() {
    mensaPlanKZO = await readMensa(7912);
    mensaPlanScheller = await readMensa(7913);
}

async function readMensa(identifier) {
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
            menu[dayName].push({
                kitchen: kitchenName,
                title: menuName,
                description: menuDescription.replace(/\n/g, ' ').replace(/  /g, ' ')
            });
        }
    }
    return menu;
}

app.listen(PORT, () => console.log("Web server is up and running on port " + PORT));
