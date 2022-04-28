import { $s, $i, $c } from "./gymial.helper.js";

export function init() {
    $i("margin-details").addEventListener("click", el => {
        if (el.target.id != "margin-details") return;
        hide();
    });

    $c("icon-x")[0].addEventListener("click", () => {
        hide();
    });
}

function show(divToShow) {
    for (let div of ["details_cont", "login-window", "grade-editor"]) {
        $i(div).style.display = (div == divToShow) ? "" : "none";
    }
}

export function showDetail(html) {
    if (html) {
        $i("detail-view").innerHTML = html;
    }
    show("details_cont");
    $i("margin-details").classList.add("visible");
}

export function showPwForm() {
    show("login-window");
    $i("margin-details").classList.add("visible");
}

export function showGradeEditor() {
    show("grade-editor");
    $i("margin-details").classList.add("visible");
}

export function hide() {
    $i("margin-details").classList.remove("visible");
}