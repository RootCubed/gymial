import * as gymial from "./gymial.module.js";

import { $i } from "./gymial.helper.js";

// load resources
import "./style.css";
import "./style.grades.css";

let wh = window.innerHeight;
document.body.style.setProperty('--wh', `${wh}px`);

if (document.readyState == "complete"){
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

function init() {
    gymial.store.init();
    
    gymial.settings.init();
    gymial.account.init();
    gymial.style.init();

    gymial.error.init();
    gymial.detail.init();
    gymial.menu.init();
    gymial.mensa.init();
    gymial.tt.init();

    // disable animation from running at page load
    $i("panels").style.display = "block";
    setTimeout(() => document.body.className = "", 500);

    window.addEventListener("resize", resizeScreen);
    window.addEventListener("orientationchange", resizeScreen);

    // web worker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register("service-worker.js").then(sw => {
            sw.addEventListener("updatefound", () => {
                let newWorker = sw.installing;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state == "installed") {
                        newWorker.postMessage({action: "skipWaiting"});
                    }
                });
            });
        });
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
        });
    }
}

let lastEvTime;
let timeout = false;
let debounceDelay = 50;
function resizeScreen() {
    // still set the wh variable, but we don't re-apply the scrolling effect yet
    let wh = window.innerHeight;
    if (document.body.style.getPropertyValue("--wh") != `${wh}px`) {
        document.body.style.setProperty("--wh", `${wh}px`);
    }

    lastEvTime = Date.now();
    if (timeout == false) {
        timeout = true;
        setTimeout(resizeEnd, debounceDelay);
    }
}

function resizeEnd() {
    if (Date.now() - lastEvTime < debounceDelay) {
        setTimeout(resizeEnd, debounceDelay);
    } else {
        timeout = false;
        gymial.tt.resizeEvent();
    }
}