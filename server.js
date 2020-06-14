const querystring = require("querystring");
const https = require("https");
const express = require("express");
const app = express();
const nodeFetch = require("node-fetch");
const cors = require("cors");
const crypto = require("crypto");
const compression = require("compression");

app.use(cors());
app.use(compression());
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
    "Cookie": "username=liam.braun; school=kzo; sturmuser=liam.braun; sturmsession=61h71r9jtijgsammm7fu6lr4gl"
};

const PORT = process.env.PORT || 3000;

let options = {
    hostname: "intranet.tam.ch",
    port: 443,
    path: "/kzo/timetable/ajax-get-timetable",
    method: "POST",
    headers: headers,
};

let token = "";

const periods = [
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

const tmpClassesP73 = [
    {
        "classId": 2497,
        "className": "C 6c"
    },
    {
        "classId": 2488,
        "className": "A 6"
    },
    {
        "classId": 2489,
        "className": "M 6a"
    },
    {
        "classId": 2493,
        "className": "M 6b"
    },
    {
        "classId": 2447,
        "className": "A 3"
    },
    {
        "classId": 2448,
        "className": "M 3"
    },
    {
        "classId": 2449,
        "className": "C 3a"
    },
    {
        "classId": 2450,
        "className": "C 3b"
    },
    {
        "classId": 2451,
        "className": "C 3c"
    },
    {
        "classId": 2452,
        "className": "CM3"
    },
    {
        "classId": 2453,
        "className": "N 3a"
    },
    {
        "classId": 2454,
        "className": "N 3b"
    },
    {
        "classId": 2456,
        "className": "W 3a"
    },
    {
        "classId": 2457,
        "className": "W 3b"
    },
    {
        "classId": 2458,
        "className": "N 3c"
    },
    {
        "classId": 2459,
        "className": "U 2a"
    },
    {
        "classId": 2460,
        "className": "U 2b"
    },
    {
        "classId": 2461,
        "className": "U 2c"
    },
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
    
        options.path = "/kzo";

        let optWithoutCookies = options;
        optWithoutCookies.headers["Cookie"] = null;
    
        let req = https.request(optWithoutCookies, res => {
            let setCookies = res.headers["set-cookie"];
            let sturmsession;
            if (setCookies) {
                for (let c of setCookies) {
                    sturmsession = c.match(/sturmsession=[0-9a-z]+/);
                }
            }
            resolve(sturmsession);
        });
    
        req.write(querystring.stringify(body));
        req.end();
    });
}

function getShit(endpoint, body) {
    options.path = endpoint;
    body.csrfToken = token;
    return new Promise(function(resolve) {
        let str = "";

        let req = https.request(options, res => {
            res.on("data", (d) => {
                str += d.toString();
            });
            res.on("end", function() {
                if (str[0] === "<" || str.length == 0) { // invalid session
                    console.log("logging in...");
                    login(process.env.user, process.env.password).then((sessionToken) => {
                        if (sessionToken != null) {
                            headers["Cookie"] = "username=liam.braun; school=kzo; sturmuser=liam.braun; " + sessionToken;
                        }
                        nodeFetch("https://intranet.tam.ch/kzo", {headers: headers}).then(r => r.text()).then(r => {
                            token = r.match(/csrfToken='([0-z]+)/)[1];
                            getShit(endpoint, body).then(r => {
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

let apiTokens = {};

async function verifyAuthentication(username, password) {
    let token = await login(username, password);
    console.log(token);
    return !!(token);
}

function getPeriod(time) {
    let currPeriod;
    for (period of periods) {
        if (time > period.startTime) {
            currPeriod = period.period;
            break;
        }
    }
    return currPeriod;
}

/*app.get("*", (req, res, next) => {
    if (req.protocol.headers["x-forwarded-proto"] != "https" || req.hostname == "localhost") {
        next();
    } else {
        res.redirect("https://" + req.headers.host + req.url);
    }
});*/

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
        verifyAuthentication(bodyJSON.user, bodyJSON.pass).then(r => {
            if (r) {
                apiTokens[bodyJSON.user] = generateAPIKey();
                res.send(apiTokens[bodyJSON.user]).end();
                return;
            }
            res.status(401).end();
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
    getShit("/kzo/timetable/ajax-get-timetable", body).then(r => {
        res.send(JSON.parse(r).data);
    });
});

app.get("/picture/:id", function (req, res) {
    let body = {
        "person": req.params.id,
        "method": "POST"
    };
    getShit("/kzo/list/get-person-picture", body).then((r) => {
        res.writeHead(200, {
            "Content-Type": "image/jpeg",
            "Content-Length": Buffer.from(r, "base64").length
        });
        res.end(Buffer.from(r, "base64"));
    });
});

app.get("/resources/:time", function (req, res) {
    console.log("period", getPeriod(req.params.time));
    let body = {
        "periodId": getPeriod(req.params.time),
        "method": "POST"
    };
    getShit("/kzo/timetable/ajax-get-resources/", body).then(r => {
        if (getPeriod(req.params.time) == 73) { // temporary hack until everything works
            res.send({
                "offline": false,
                "data": [
                    ...tmpClassesP73,
                    ...JSON.parse(r).data.teachers, ...JSON.parse(r).data.students, ...JSON.parse(r).data.rooms
                ]
            });
        } else {
            res.send({
                "offline": false,
                "data": [...JSON.parse(r).data.classes, ...JSON.parse(r).data.teachers, ...JSON.parse(r).data.students, ...JSON.parse(r).data.rooms]
            });
        }
    });
});

app.get("/getName/:id", function (req, res) {
    let body = {
        "id": req.params.id,
        "method": "POST"
    };
    getShit("/kzo/list/get-person-name", body).then((r) => {
        res.send(r);
    });
});

app.get("/class-personal-details/:classID", function (req, res) {
    let body = {
        "method": "GET"
    };
    let period = 72;
    if (req.params.classID >= 2438) period = 73;
    getShit("/kzo/list/getlist/list/12/id/" + req.params.classID + "/period/" + period, body).then(r => {
        res.send(r);
    });
});

app.get("/period-from-time/:time", function (req, res) {
    res.end(getPeriod(req.params.time).toString());
});

app.listen(PORT, () => console.log("Web server is up and running on port " + PORT));
