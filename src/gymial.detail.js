import { $esc, $i, $c } from "./gymial.helper.js";

export function init() {
    $i("margin-details").addEventListener("click", el => {
        if (el.target.id != "margin-details") return;
        hide();
    });

    $c("icon-x")[0].addEventListener("click", () => {
        hide();
    });
    
    $i("grade-type-exam").addEventListener("click", () => {
        gradeSwitchToTypeExam();
    });
    $i("grade-type-bonus").addEventListener("click", () => {
        gradeSwitchToTypeBonus();
    });
    
    $i("grade-weight-full").addEventListener("click", () => {
        gradeSwitchToWeightTypeFull();
    });
    $i("grade-weight-percentire").addEventListener("click", () => {
        gradeSwitchToWeightTypePercEntire();
    });

    $i("grade-bonus-plus").addEventListener("click", () => {
        gradeSwitchBonusPlus();
    });
    $i("grade-bonus-minus").addEventListener("click", () => {
        gradeSwitchBonusMinus();
    });
}

function show(divToShow) {
    for (let div of ["details_cont", "login-window", "grade-editor"]) {
        $i(div).style.display = (div == divToShow) ? "" : "none";
    }
    $i("scrollLimiter").classList.add("blur");
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

let currGradeType = "exam";
let currWeightType = "fullgrade";

let hideRej;

function gradeSwitchToTypeExam() {
    $i("grade-cont-typeexam").style.display = "";
    $i("grade-cont-typebonus").style.display = "none";
    $i("grade-type-exam").classList.add("active");
    $i("grade-type-bonus").classList.remove("active");
    currGradeType = "exam";
}
function gradeSwitchToTypeBonus() {
    $i("grade-cont-typeexam").style.display = "none";
    $i("grade-cont-typebonus").style.display = "";
    $i("grade-type-exam").classList.remove("active");
    $i("grade-type-bonus").classList.add("active");
    currGradeType = "bonus";
}

function gradeSwitchToWeightTypeFull() {
    $i("grade-weight-full").classList.add("active");
    $i("grade-weight-percentire").classList.remove("active");
    currWeightType = "fullgrade";
}
function gradeSwitchToWeightTypePercEntire() {
    $i("grade-weight-full").classList.remove("active");
    $i("grade-weight-percentire").classList.add("active");
    currWeightType = "percentire";
}

function gradeSwitchBonusPlus() {
    $i("grade-bonus-plus").classList.add("active");
    $i("grade-bonus-minus").classList.remove("active");
}
function gradeSwitchBonusMinus() {
    $i("grade-bonus-plus").classList.remove("active");
    $i("grade-bonus-minus").classList.add("active");
}

export function showGradeEditor(config) {
    show("grade-editor");
    $i("grade-form-title").innerHTML = $esc(config.title) || "";
    if (config.hideGradeEntry) {
        gradeSwitchToTypeExam();
        $i("grade-form-grade-type-cont").style.display = "none";
        $i("grade-form-grade-entry-cont").style.display = "none";
    } else {
        $i("grade-form-grade-type-cont").style.display = "";
        $i("grade-form-grade-entry-cont").style.display = "";
    }
    $i("grade-input-title").value = config.gradeName || "";
    if (config.gradeType) {
        if (config.gradeType == "regular") {
            gradeSwitchToTypeExam();
        } else {
            gradeSwitchToTypeBonus();
        }
    }
    $i("grade-input-grade").value = config.gradeVal || "";
    $i("grade-input-bonus").value = config.bonusVal || "";
    if (config.weightType) {
        if (config.weightType == "fullgrade") {
            gradeSwitchToWeightTypeFull();
        } else {
            gradeSwitchToWeightTypePercEntire();
        }
    }
    $i("grade-input-weight").value = config.weightVal || "";
    $i("margin-details").classList.add("visible");

    return new Promise((res, rej) => {
        hideRej = rej;
        $i("grade-edit-cancel").addEventListener("click", () => {
            hide();
        }, {once: true});

        $i("grade-edit-submit").addEventListener("click", () => {
            res({
                "title": $i("grade-input-title").value,
                "grade_ype": currGradeType,
                "value": $i(
                    (currGradeType == "exam") ? "grade-input-grade" : "grade-input-bonus"
                ).value,
                "weight_type": currWeightType,
                "weight": $i("grade-input-weight").value
            });
            hideRej = null;
            hide();
        }, {once: true});
    });
}

export function hide() {
    $i("margin-details").classList.remove("visible");
    $i("scrollLimiter").classList.remove("blur");
    if (hideRej) hideRej("cancel");
}