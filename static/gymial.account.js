import { $s, $i, $c } from "./gymial.helper.js";

export function init() {
    // try to see if we are already logged in
    loadPersData();
}

export function loadPersData() {
    $i("invalid-login").style.display = "none";
    fetch("/myData").then(res => res.json()).then(res => {
        if (res.total > 0) {
            let persData = res.data[0];
            $i("ownName").innerText = persData.Vorname + " " + persData.Nachname;
            $i("otherDetails").innerText = persData.Adresse + ", " + persData.PLZ + " " + persData.Ort;
            $i("login-form").style.display = "none";
            $i("accountinfo").style.display = "inline";
            $s("#panel-settings h2").innerText = "Account";
            $i("login").style.display = "none";
            $i("persDetails").style.display = "";
        }
    });
}

export function logout() {
    $i("invalid-login").style.display = "none";
    $s("#panel-settings h2").innerText = "Account (nicht angemeldet)";
    $i("login").style.display = "inline";
    $i("accountinfo").style.display = "none";
}