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
    
    $i("persplan").addEventListener("click", () => {
        let persData = gymial.account.getPersData();
        gymial.tt.setSelectedPerson(persData.Nachname + ", " + persData.Vorname);
        gymial.tt.loadTTData("student", persData.PersonID, gymial.tt.getCurrTime(), gymial.tt.getCurrResources());
        $i("link-timetable").click();
    });
}


export function showPwForm() {
    $i("details_cont").style.display = "none";
    $i("login-window").style.display = "inline";
    $i("margin-details").classList.add("visible");
}