import { $s, $i, $c } from "./gymial.helper.js";
import * as gymial from "./gymial.module.js";

let persData = {};

export function init() {
    // try to see if we are already logged in
    loadPersData();

    // logging in
    $i("login-form").addEventListener("submit", ev => {
        $i("invalid-login").style.display = "none";
        $i("login-submit").style.display = "none";
        let spinner = $s("#button-spinner img");
        spinner.style.display = "inline";
        ev.preventDefault();
        let username = $i("login-user").value;
        login(username, $i("login-pw").value).then(token => {
            gymial.store.setAPIKey(username, token);
            loadPersData();
            gymial.tt.loadTTData(); // resources will be different when logged in
            $i("link-timetable").click();
            gymial.detail.hide();
        }).catch(() => {
            // Unsuccessful authentication
            $i("invalid-login").style.display = "block";
            $i("login-submit").style.display = "inline";
            spinner.style.display = "none";
        });
        return false; // prevent redirect
    });
}

export async function login(username, password) {
    let authReq = await fetch("/auth", {
        method: "post",
        body: `user=${username}&pass=${password}`
    });
    if (authReq.status == 401) {
        throw new Error("401");
    }
    let token = await authReq.text();
    if (!token) throw new Error("401");
    return token;
}

export function loadPersData() {
    $i("invalid-login").style.display = "none";
    fetch("/myData").then(res => res.json()).then(res => {
        persData = res.data[0];
        $i("ownName").innerText = persData.Vorname + " " + persData.Nachname;
        $i("otherDetails").innerText = persData.Adresse + ", " + persData.PLZ + " " + persData.Ort;
        $i("accountinfo").style.display = "inline";
        $s("#panel-settings h2").innerText = "Account";
        $i("login-btn-cont").style.display = "none";
        $i("persDetails").style.display = "";
    }).catch(() => {
        logout();
    });
}

export function logout() {
    $i("invalid-login").style.display = "none";
    $s("#panel-settings h2").innerText = "Account (nicht angemeldet)";
    $i("login-btn-cont").style.display = "";
    $i("accountinfo").style.display = "none";
    $i("login-submit").style.display = "";
    $s("#button-spinner img").style.display = "none";
}

export function getPersData() {
    return persData;
}