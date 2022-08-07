import { $s, $i, $c } from "./gymial.helper.js";

export function init() {
    hide();
}

export function show(title, message) {
    $i("error-title").innerText = title;
    $i("error-desc").innerHTML = message;
    $i("error-timetable").classList.add("visible");
    $i("timetable").style.display = "none";
}

export function hide() {
    $i("error-timetable").classList.remove("visible");
    $i("timetable").style.display = "table";
}