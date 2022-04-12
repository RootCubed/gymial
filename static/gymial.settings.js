import * as gymial from "./gymial.module.js";

import { $s, $i, $c } from "./gymial.helper.js";

export function init() {
    // open popup
    $i("login").addEventListener("click", () => {
        showPwForm();
    });

    // logging out
    $i("logout").addEventListener("click", () => {
        Cookies.remove("username");
        Cookies.remove("apiToken");
        window.localStorage.removeItem("api");
        postLogout();
    });

    // logging in
    $i("login-form").addEventListener("submit", async ev => {
        $i("invalid-login").style.display = "none";
        $i("login-submit").style.display = "none";
        let spinner = $s("#button-spinner img");
        spinner.style.display = "inline";
        ev.preventDefault();
        let authReq = await fetch("/auth", {
            method: "post",
            body: `user=${$i("login-user").value}&pass=${$i("login-pw").value}`
        });
        if (authReq.status == 401) {
            // Unsuccessful authentication
            $i("invalid-login").style.display = "block";
            $i("login-submit").style.display = "inline";
            spinner.style.display = "none";
            return;
        }
        let token = await authReq.text();
        if (!token) return;
        gymial.store.setAPIKey($i("login-user").value, token);
        postLogin();
        init(); // resources will be different when logged in
        $i("link-timetable").click();
        gymial.detail.hide();
    });
    
    $i("persplan").addEventListener("click", () => {
        let persData = gymial.account.getPersData();
        gymial.tt.setSelectedPerson(persData.Nachname + ", " + persData.Vorname);
        gymial.tt.loadTTData("student", persData.PersonID, gymial.tt.getCurrTime(), gymial.tt.getCurrResources());
        $i("link-timetable").click();
    });
}


function showPwForm() {
    $i("details_cont").style.display = "none";
    $i("login-window").style.display = "inline";
    $i("margin-details").classList.add("visible");
}