import express from "express";
const app = express();
import cors from "cors";
import compression from "compression";
import fs from "fs";
import zlib from "zlib";

import * as db from "./db.js";
import ds from "./data_sources.js";
import * as helper from "./helper.js";

const MAX_GRADES_SIZE = 5000; // 5KB

app.use(async (req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https" && req.hostname !== "localhost" && !req.hostname.includes("192.168")) {
        res.redirect(301, `https://${req.header("host")}${req.url}`);
    } else {
        if (req.headers.cookie) {
            let user = cookieToUser(req.headers.cookie);
            try {
                let isAuth = await db.isAuthorized(user);
                db.userReq((isAuth) ? user.username : null);
            } catch (e) {
                console.error("Error getting isAuthorized:", e);
            }
        }
        next();
    }
});

app.use((req, res, next) => {
    res.setTimeout(20000, () => res.sendStatus(408));
    next();
});

app.use(cors());
app.use(compression());
app.use(express.static("static"));

const authorizeMiddleware = async (req, res, next) => {
    let user = cookieToUser(req.headers.cookie);
    if (!await db.isAuthorized(user)) {
        res.status(401).end();
        return;
    }
    req.user = user;
    next();
};

let ttCache = {};
let resCache = {};
const ttCacheTimeout = ((process.env.NODE_ENV == "development") ? 24 : 1) * 1000 * 60 * 10; // 10 minutes (4h in development branch)
const resCacheTimeout = 1000 * 60 * 60 * 5; // 5 hours

const goodTTCache = c => (!!c && !!c.time) && (new Date() - c.time) < ttCacheTimeout;
const goodResCache = c => (!!c && !!c.time) && (new Date() - c.time) < resCacheTimeout;

async function verifyAuthentication(username, password) {
    let token;
    try {
        token = await ds.tam.login(username, password);
    } catch (e) {
        return false;
    }
    if (!token) return false;
    db.savePersData(username, JSON.stringify(token[1]));
    return true;
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

function toStandardFormat(token) {
    return token.toLowerCase().replace(/\@studmail.kzo.ch/g, "").trim();
}

app.post("/auth", (req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        let bodySplitted = body.split('&');
        let bodyJSON = {};
        for (let arg of bodySplitted) {
            bodyJSON[arg.split('=')[0]] = arg.split('=')[1];
        }
        if (bodyJSON.user && bodyJSON.pass) {
            bodyJSON.user = toStandardFormat(bodyJSON.user);
            const goodAuth = await verifyAuthentication(bodyJSON.user, bodyJSON.pass);
            if (goodAuth) {
                const tok = await db.authenticateUser(bodyJSON.user);
                res.send(tok).end();
            } else {
                res.status(401).end();
            }
        }
    });
});

app.get("/myData", authorizeMiddleware, async (req, res) => {
    let persData = await db.getPersData(req.user.username);
    if (persData == null) {
        res.status(500).end();
        return;
    }
    res.json(JSON.parse(persData));
});

async function ttCallback(user, r) {
    let isAuth = await db.isAuthorized(user);
    let json = JSON.parse(r);
    if (json.status != 1) {
        throw json.message;
    }
    // hyphenate title
    json.data = json.data.map(entry => {
        if (entry.title) {
            entry.title = helper.hyphenate(entry.title, "&shy;");
        }
        return entry;
    });
    if (!isAuth) {
        const propsToKeep = [
            "id", "periodId", "start", "end", "lessonDate", "lessonStart", "lessonEnd", "lessonDuration",
            "timetableEntryTypeId", "timetableEntryType", "timetableEntryTypeLong", "timetableEntryTypeShort",
            "title", "courseId", "courseName", "course", "subjectName", "classId", "className", "teacherAcronym",
            "roomId", "roomName", "teacherId", "isAllDay"
        ];
        let basicJSON = new Array(json.data.length);
        for (let i = 0; i < json.data.length; i++) {
            basicJSON[i] = {};
            for (let p of propsToKeep) {
                basicJSON[i][p] = json.data[i][p];
            }
        }
        return basicJSON;
    } else {
        return json.data;
    }
}

function getFirstDayOfWeek(d) {
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

app.get("/timetable/:type/:id/:time", async (req, res) => {
    let timeNum = parseInt(req.params.time);
    let body = {
        "startDate": req.params.time,
        "endDate": timeNum + 4 * 24 * 60 * 60 * 1000,
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
            res.sendStatus(400).end();
            return;
    }
    let user = cookieToUser(req.headers.cookie);
    let ttCacheStr = `${req.params.type}_${req.params.id}_${getFirstDayOfWeek(new Date(timeNum)).toDateString()}`;
    let ttCacheObj = ttCache[ttCacheStr];
    let ttCacheData;
    try {
        ttCacheData = await ttCallback(user, ttCache[ttCacheStr].data);
    } catch (e) {}

    if (goodTTCache(ttCacheObj) && ttCacheData) {
        res.json({"status": "ok", "data": ttCacheData});
        return;
    }
    body[req.params.type + "Id[]"] = req.params.id;
    ds.tam.request("/kzo/timetable/ajax-get-timetable", body).then(async r => {
        ttCache[ttCacheStr] = {
            time: new Date(),
            data: r
        };
        let ttData = await ttCallback(user, r);
        try {
            res.json({"status": "ok", "data": ttData});
        } catch (e) {
            res.json({"status": "error", "data": e.message});
        }
    }).catch(e => {
        if (ttCacheData) {
            res.json({"status": "intranet_offline", "data": ttCacheData, "time": ttCacheObj.time});
        } else {
            res.json({"status": "intranet_offline_nocache"});
        }
    });
});

async function resourcesCallback(user, r) {
    const isAuth = await db.isAuthorized(user);
    const jsonData = JSON.parse(r).data;
    if (!isAuth) {
        return {
            "offline": false,
            "data": jsonData.classes
        };
    }
    return {
        "offline": false,
        "data": [...jsonData.classes, ...jsonData.teachers, ...jsonData.students, ...jsonData.rooms]
    };
}

app.get("/resources/:time", async (req, res) => {
    let body = {
        "periodId": helper.getPeriod(req.params.time),
        "method": "POST"
    };
    let user = cookieToUser(req.headers.cookie);
    
    let resCacheObj;
    try {
        resCacheObj = (resCache["data_" + body.periodId]) ? resCache["data_" + body.periodId] : {};
    } catch (e) {}

    if (goodResCache(resCacheObj)) {
        res.json({"status": "ok", "data": await resourcesCallback(user, resCacheObj.data)});
        return;
    }
    ds.tam.request("/kzo/timetable/ajax-get-resources/", body).then(async r => {
        if (!JSON.parse(r).data.classes) {
            throw new Error("successful_login_invalid_result");
        }
        resCache["data_" + body.periodId] = {
            time: new Date(),
            data: r
        };
        let resData = await resourcesCallback(user, r);
        res.json({"status": "ok", "data": resData});
    }).catch(async e => {
        if (e.message == "successful_login_invalid_result") {
            res.json({"status": "error"});
        } else if (resCache && resCache["data_" + body.periodId]) {
            res.json({"status": "intranet_offline", "data": await resourcesCallback(user, resCacheObj.data), "time": resCache.time});
        } else {
            res.json({"status": "intranet_offline_nocache"});
        }
    });
});

app.get("/getName/:id", authorizeMiddleware, async (req, res) => {
    let body = {
        "id": req.params.id,
        "method": "POST"
    };
    ds.tam.request("/kzo/list/get-person-name", body).then((r) => {
        res.send(JSON.parse(r));
    }).catch(e => {
        res.json({"status": "intranet_offline_nocache"});
    });
});

app.get("/search-internal-kzoCH/:firstName/:lastName/:class", authorizeMiddleware, async (req, res) => {
    let fN = "";
    let lN = "";
    let cl = "";
    if (req.params.firstName != "_") fN = req.params.firstName;
    if (req.params.lastName != "_") lN = req.params.lastName;
    if (req.params.class != "_") cl = req.params.class;
    ds.kzoch.personSearch(fN, lN, cl).then(r => res.send(r)).catch(e => {
        res.sendStatus(500);
    });
});

app.get("/class-personal-details/:classID", authorizeMiddleware, async (req, res) => {
    let startTime = helper.getPeriodFromClass(req.params.classID).startTime;
    let body = {
        "startDate": startTime,
        "endDate": startTime + 4 * 24 * 60 * 60 * 1000,
        "holidaysOnly": 0,
        "method": "POST",
        "classId[]": req.params.classID
    };
    ds.tam.request("/kzo/timetable/ajax-get-timetable", body).then(r => {
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
        res.json(best.studentArray);
    }).catch(e => {
        res.json({"status": "intranet_offline_nocache"});
    });
});

app.get("/period-from-time/:time", (req, res) => {
    res.end(`${helper.getPeriod(req.params.time).toString()},${helper.getPeriod(new Date().getTime()).toString()}`);
});

const styles = JSON.parse(fs.readFileSync("style_presets.json"));
app.get("/styles", (req, res) => {
    res.end(JSON.stringify(styles));
});

let mensaPlanKZO;
let mensaPlanScheller;

app.get("/mensa/KZO", (req, res) => {
    if (mensaPlanKZO) {
        res.json(mensaPlanKZO).end();
        return;
    }
    res.status(503).end();
});

app.get("/mensa/Schellerstrasse", (req, res) => {
    if (mensaPlanScheller) {
        res.json(mensaPlanScheller).end();
        return;
    }
    res.status(503).end();
});

updateMensaCache();
setInterval(updateMensaCache, 1000 * 60 * 60);

async function updateMensaCache() {
    mensaPlanKZO = await ds.mensa.getData(7912);
    mensaPlanScheller = await ds.mensa.getData(7913);
}

app.post("/grades", authorizeMiddleware, async (req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        // assert string is valid JSON
        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            res.status(400).send("invalid_request").end();
            return;
        }
        let compressed = zlib.deflateSync(JSON.stringify({
            data: json,
            lastmod: Date.now()
        })).toString("base64");
        if (compressed.length > MAX_GRADES_SIZE) {
            res.status(400).send("too_large").end();
            return;
        }
        db.setGradeData(req.user.username, compressed);
        res.send("ok");
    });
});

app.get("/grades", authorizeMiddleware, async (req, res) => {
    try {
        const grades = await db.getGradeData(req.user.username);
        if (grades.lastmod && grades.lastmod == -1) {
            res.json(grades);
            return;
        }
        const decompressed = zlib.inflateSync(Buffer.from(grades, "base64"));
        const decompData =  JSON.parse(decompressed);
        res.json(decompData);
    } catch (e) {
        console.error("Error fetching grade data:", e);
        res.status(500).end();
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Web server is up and running on port " + PORT));

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    console.trace();
});

process.on("uncaughtException", err => {
    console.error("Uncaught error thrown: ", err);
    console.trace();
    process.exit(1);
});