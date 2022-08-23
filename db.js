import { createClient } from "redis";
import { randomBytes } from "crypto";

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("ready", () => console.log("Redis client connected."));
redisClient.on("reconnecting", () => console.log("Reconnecting to redis server..."));
redisClient.on("error", err => console.log("Redis error: ", err));

setTimeout(async () => {
    await redisClient.connect();
    
    // setup database
    if (!(await redisClient.get(genKN("nonAuthReqs")))) {
        redisClient.set(genKN("nonAuthReqs"), 0);
    }

}, 500);

const genKN = (key) => `${process.env.REDIS_PREFIX}:${key}`;

if (!process.env.REDIS_PREFIX) {
    console.warn("Environment variable \"REDIS_PREFIX\" is not set!");
}

export function userReq(username) {
    if (!username) {
        redisClient.incr(genKN("nonAuthReqs"));
    } else {
        redisClient.hIncrBy(genKN(`user:${username}`), "requests", 1);
    }
}

export async function getPersData(username) {
    return await redisClient.hGet(genKN(`user:${username}`), "persData");
}
export function savePersData(username, data) {
    redisClient.hSet(genKN(`user:${username}`), "persData", data);
}

export async function getGradeData(username) {
    const grades = await redisClient.hGet(genKN(`user:${username}`), "grades");
    if (!grades) {
        return {
            data: [],
            lastmod: -1
        };
    }
    return grades;
}
export async function setGradeData(username, data) {
    await redisClient.hSet(genKN(`user:${username}`), "grades", data);
}

export async function isAuthorized(userData) {
    if (!userData) return false;
    if (!userData.username || !userData.apiToken) return false;
    let userTokens = await redisClient.get(genKN(`tokens:${userData.username}`));
    const json = userTokens ? JSON.parse(userTokens) : {};
    if (!json[userData.apiToken]) return false;
    return new Date(json[userData.apiToken]).getTime() > Date.now();
}

function generateAPIKey() {
    return randomBytes(16).toString("hex");
}

export async function authenticateUser(username) {
    let genToken = generateAPIKey();
    const keyNameTok = genKN(`tokens:${username}`);
    const keyNameUser = genKN(`user:${username}`);
    let tokens = await redisClient.get(keyNameTok);
    let tokenJSON = tokens ? JSON.parse(tokens) : {};

    // clean up invalidated tokens
    let tokenList = {};
    let keepTokens = Object.keys(tokenJSON).sort((a, b) => tokenJSON[b] - tokenJSON[a]).slice(0, 10); // keep 10 newest tokens
    for (let key of keepTokens) {
        if (new Date(tokenJSON[key]).getTime() > Date.now()) tokenList[key] = tokenJSON[key];
    }
    tokenList[genToken] = Date.now() + 1000 * 60 * 60 * 24 * 365; // store token for one year

    redisClient.set(keyNameTok, JSON.stringify(tokenList));
    const reqs = await redisClient.hGet(keyNameUser, "requests");
    if (reqs == null) redisClient.hSet(keyNameUser, "requests", 0);
    return genToken;
}
