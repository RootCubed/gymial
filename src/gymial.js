import * as gymial from "./gymial.module.js";

import { $i } from "./gymial.helper.js";

// load resources
import "./style.css";
import "./style.mobile.css";
import "./style.grades.css";

if (document.readyState == "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

function init() {

    let wh = window.innerHeight;
    document.body.style.setProperty('--wh', `${wh}px`);

    gymial.store.init();

    gymial.settings.init();
    gymial.account.init();
    gymial.style.init();

    gymial.error.init();
    gymial.detail.init();
    gymial.grades.init();
    gymial.menu.init();
    gymial.mensa.init();
    gymial.tt.init();

    // disable animation from running at page load
    $i("panels").style.display = "block";
    setTimeout(() => document.body.className = "", 500);

    window.addEventListener("resize", resizeScreen);
    window.addEventListener("orientationchange", resizeScreen);
}

let resizeTimer;
function resizeScreen() {
    let wh = window.innerHeight;
    if (document.body.style.getPropertyValue("--wh") != `${wh}px`) {
        document.body.style.setProperty("--wh", `${wh}px`);
    }

    // hacky fix for webkit browsers
    gymial.tt.removeScrolling();

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        // sometimes iOS bugs out a bit, so we check it again
        let wh = window.innerHeight;
        if (document.body.style.getPropertyValue("--wh") != `${wh}px`) {
            document.body.style.setProperty("--wh", `${wh}px`);
        }
        gymial.tt.resizeEvent();
    }, 150);
}