import { $esc, $i, $c } from "./gymial.helper.js";

export function init() {
    $i("grade-form").addEventListener("submit", () => {
        try {
            let weightVal = $i("grade-input-weight").value;
            if (weightVal.endsWith("%")) {
                weightVal = parseFloat(weightVal) / 100;
            } else {
                weightVal = parseFloat(weightVal);
            }
            if (modalPromise) modalPromise.res({
                "title": $i("grade-input-title").value,
                "grade_type": currGradeType,
                "value": parseFloat($i(
                    (currGradeType == "regular") ? "grade-input-grade" : "grade-input-bonus"
                ).value),
                "weight_type": currWeightType,
                "weight": weightVal
            });
            modalPromise = null;
        } catch (e) {}
        hide();
        return false; // prevent redirect
    });

    $i("margin-details").addEventListener("click", el => {
        if (el.target.id != "margin-details") return;
        hide();
    });
    $c("icon-x")[0].addEventListener("click", () => {
        hide();
    });
    $i("grade-edit-cancel").addEventListener("click", () => {
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

let modalPromise;

function gradeSwitchToTypeExam() {
    $i("grade-cont-typeexam").style.display = "";
    $i("grade-cont-typebonus").style.display = "none";
    $i("grade-type-exam").classList.add("active");
    $i("grade-type-bonus").classList.remove("active");
    $i("grade-input-grade").required = true;
    $i("grade-input-weight").required = true;
    $i("grade-input-bonus").required = false;
    currGradeType = "regular";
}
function gradeSwitchToTypeBonus() {
    $i("grade-cont-typeexam").style.display = "none";
    $i("grade-cont-typebonus").style.display = "";
    $i("grade-type-exam").classList.remove("active");
    $i("grade-type-bonus").classList.add("active");
    $i("grade-input-grade").required = false;
    $i("grade-input-weight").required = false;
    $i("grade-input-bonus").required = true;
    currGradeType = "bonus";
}

function gradeSwitchToWeightTypeFull() {
    $i("grade-weight-full").classList.add("active");
    $i("grade-weight-percentire").classList.remove("active");
    $i("grade-weight-percent-symbol").style.display = "none";
    if (currWeightType == "perc_entire") {
        let wVal = parseFloat($i("grade-input-weight").value);
        if (!isNaN(wVal)) $i("grade-input-weight").value = wVal / 100;
    }
    currWeightType = "fullgrade";
}
function gradeSwitchToWeightTypePercEntire() {
    $i("grade-weight-full").classList.remove("active");
    $i("grade-weight-percentire").classList.add("active");
    $i("grade-weight-percent-symbol").style.display = "";
    if (currWeightType == "fullgrade") {
        let wVal = parseFloat($i("grade-input-weight").value);
        if (!isNaN(wVal)) $i("grade-input-weight").value = wVal * 100;
    }
    currWeightType = "perc_entire";
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
    $i("grade-form").reset();
    $i("grade-input-title").focus();
    $i("grade-form-title").innerHTML = $esc(config.title) || "";
    $i("grade-input-title").value = config.gradeName || "";
    let gradeVal = (config.gradeVal == undefined) ? "" : config.gradeVal;
    if (config.gradeType && config.gradeType == "bonus") {
        $i("grade-input-bonus").value = gradeVal || "";
        gradeSwitchToTypeBonus();
    } else {
        $i("grade-input-grade").value = gradeVal || "";
        gradeSwitchToTypeExam();
    }
    let weightVal = (config.weightVal == undefined) ? "" : config.weightVal;
    if (config.weightType && config.weightType == "perc_entire") {
        gradeSwitchToWeightTypePercEntire();
        $i("grade-input-weight").value = (weightVal * 100 + "%") || "";
    } else {
        gradeSwitchToWeightTypeFull();
        $i("grade-input-weight").value = weightVal || "";
    }

    $i("grade-form-grade-type-cont").style.display = "";
    $i("grade-form-grade-entry-cont").style.display = "";
    if (config.hideGradeEntry) {
        gradeSwitchToTypeExam();
        $i("grade-form-grade-type-cont").style.display = "none";
        $i("grade-form-grade-entry-cont").style.display = "none";
        $i("grade-input-grade").required = false;
    }

    $i("margin-details").classList.add("visible");

    return new Promise((res, rej) => {
        modalPromise = {
            res: res,
            rej: () => rej("cancel")
        };
    });
}

export function hide() {
    $i("margin-details").classList.remove("visible");
    $i("scrollLimiter").classList.remove("blur");
    if (modalPromise) modalPromise.rej();
    modalPromise = null;
}