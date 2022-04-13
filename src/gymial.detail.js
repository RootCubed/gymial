import { $s, $i, $c } from "./gymial.helper.js";

export function init() {
    // TODO: remove this probably
    setTimeout(() => {
        $i("margin-details").classList.remove("no-transition");
    }, 500);

    $i("margin-details").addEventListener("click", el => {
        if (el.target.id != "margin-details") return;
        hide();
    });

    $c("icon-x")[0].addEventListener("click", () => {
        hide();
    });
}

export function show(html) {
    if (html) {
        $i("detail-view").innerHTML = html;
    }
    $i("details_cont").style.display = "";
    $i("login-window").style.display = "none";
    $i("margin-details").classList.add("visible");
}

export function hide() {
    $i("margin-details").classList.remove("visible");
}