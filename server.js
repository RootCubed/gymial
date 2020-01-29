const querystring = require("querystring");
const https = require("https");
const express = require("express");
const app = express();
const nodeFetch = require("node-fetch");

let headers = {
    "Connection": "keep-alive",
    "accept": "application/json, text/javascript, */*; q=0.01",
    "Origin": "https://intranet.tam.ch",
    "x-requested-with": "XMLHttpRequest",
    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6",
    "User-Agent": "Node.js application",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Host": "intranet.tam.ch",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Referer": "https://intranet.tam.ch/kzo/calendar",
    "Cookie": "username=liam.braun; school=kzo; sturmuser=liam.braun; sturmsession="
};

const PORT = process.env.PORT || 3000;

let options = {
    hostname: "intranet.tam.ch",
    port: 443,
    path: "/kzo/timetable/ajax-get-timetable",
    method: "POST",
    headers: headers,
}

const periods = [
    {
        "period": 72,
        "startTime": 1582498800000
    },
    {
        "period": 71,
        "startTime": 0
    }
];

function login() {
    return new Promise((resolve, reject) => {
        let body = {
            loginuser: process.env.user,
            loginpassword: process.env.password,
            loginschool: "kzo"
        }
    
        options.path = "/kzo";
    
        let req = https.request(options, res => {
            let setCookies = res.headers["set-cookie"];
            for (let c of setCookies) {
                sturmsession = c.match(/sturmsession=[0-9a-z]+/);
                if (sturmsession != null) {
                    headers["Cookie"] = "username=liam.braun; school=kzo; sturmuser=liam.braun; " + sturmsession;
                }
            }
            resolve();
        });
    
        req.write(querystring.stringify(body));
        req.end();
    });
}

function getShit(endpoint, body) {
    options.path = endpoint;
    return new Promise(function(resolve, reject) {
        let str = "";

        let req = https.request(options, res => {
            res.on("data", (d) => {
                str += d.toString();
            });
            res.on("end", function() {
                if (str[0] == "<") { // invalid session
                    login().then(() => {
                        getShit(endpoint, body).then(r => {
                            resolve(r);
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

app.get("/getTimetable/:type/:id/:time", function (req, res) {
    let body = {
        "startDate": req.params.time,
        "endDate": parseInt(req.params.time) + 4 * 24 * 60 * 60 * 1000,
        "holidaysOnly": 0
    }
    body[req.params.type + "Id[]"] = req.params.id;
    getShit("/kzo/timetable/ajax-get-timetable", body).then(r => {
        res.send(JSON.parse(r).data);
    });
});

app.get("/getPicture/:id", function (req, res) {
    let body = {
        "person": req.params.id
    }
    getShit("/kzo/list/get-person-picture", body).then((r) => {
        res.writeHead(200, {
            "Content-Type": "image/jpeg",
            "Content-Length": Buffer.from(r, "base64").length
        });
        res.end(Buffer.from(r, "base64"));
    });
});

app.get("/getClassNumPeople/:className", function (req, res) {
    nodeFetch("https://www.kzo.ch/fileadmin/scripts/personen/klassenliste_ajax_include.php?klasse=" + req.params.className)
    .then(res => res.text())
    .then(body => {
        res.end(body.match(/Anzahl Sch&uuml;lerInnen: \d+/)[0].slice(-2));
    });
});

app.get("/getIDs/:time", function (req, res) {
    let currPeriod;
    for (period of periods) {
        if (req.params.time > period.startTime) {
            currPeriod = period.period;
            break;
        }
    }
    let body = {}
    getShit("/kzo/timetable/ajax-get-resources/period/" + currPeriod, body).then(r => {
        res.send([...JSON.parse(r).data.classes, ...JSON.parse(r).data.teachers]);
    });
});

app.get("/getGrades/:student/:course", function (req, res) {
    let body = {
        "studentId": req.params.student,
        "courseId": req.params.course,
        "periodId": 71
    }
    getShit("/kzo/gradebook/ajax-list-get-grades", body).then((r) => {
        console.log(JSON.parse(r).data);
        res.send(JSON.parse(r).data);
    });
});

app.use(express.static("static"));
app.listen(PORT, () => console.log("Web server is up and running on port " + PORT));