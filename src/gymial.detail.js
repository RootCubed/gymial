import { $esc, $i, $c } from "./gymial.helper.js";

let grEditPromise, modalPromise;

export function init() {
    $i("grade-form").addEventListener("submit", () => {
        try {
            let resVal = {
                "title": $i("grade-input-title").value,
                "grade_type": currGradeType,
                "value": parseFloat($i(
                    (currGradeType == "regular") ? "grade-input-grade" : "grade-input-bonus"
                ).value),
                "weight_type": currWeightType
            };
            let weightVal = parseWeightVal($i("grade-input-weight").value);
            if (typeof weightVal == "object") {
                resVal.frac_weight = weightVal;
            } else {
                resVal.weight = weightVal;
            }
            if (grEditPromise) grEditPromise.res(resVal);
            grEditPromise = null;
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
    $i("grade-edit-submit").addEventListener("click", () => {
        $i("grade-form").classList.add("validate");
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
    $i("grade-weight-perc_entire").addEventListener("click", () => {
        gradeSwitchToWeightTypePercEntire();
    });

    $i("grade-bonus-plus").addEventListener("click", () => {
        gradeSwitchBonusPlus();
    });
    $i("grade-bonus-minus").addEventListener("click", () => {
        gradeSwitchBonusMinus();
    });

    $i("grade-input-weight").addEventListener("input", () => {
        let val = $i("grade-input-weight").value;
        if (val.match(/\d+\/.*/g) && parseInt(val.split("/")[0]) != 100) {
            hidePercent();
        } else if (currWeightType == "perc_entire") {
            showPercent();
        }
        let parsed = parseWeightVal(val);
        let closeToFrac = isCloseToFraction(parsed);
        if (!isNaN(parsed) && typeof parsed != "object" && closeToFrac != false) {
            $i("label-grade-weight-hint").classList.remove("hidden");
            $i("label-grade-weight-hint").innerHTML = `(Tipp: du kannst auch Brüche eingeben, z.B. ${closeToFrac})`;
        } else {
            $i("label-grade-weight-hint").classList.add("hidden");
        }
    });

    $i("modal-no").addEventListener("click", () => {
        hide();
    });

    $i("modal-yes").addEventListener("click", () => {
        let resVal = {
            "input": $i("modal-input").value
        };
        if (modalPromise) modalPromise.res(resVal);
        modalPromise = null;
        hide();
        return false; // prevent redirect
    });
}

function show(divToShow) {
    $i("details-overlay").style.display = "";
    for (let div of ["details_cont", "login-window", "grade-editor", "simple-modal"]) {
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

function showPercent() {
    $i("grade-weight-percent-symbol").style.display = "";
}

function hidePercent() {
    $i("grade-weight-percent-symbol").style.display = "none";
}

function parseWeightVal(val) {
    if (val.includes("/")) {
        return { numer: parseInt(val.split("/")[0]), denom: parseInt(val.split("/")[1]) };
    }
    return parseFloat(val);
}

function isCloseToFraction(val) {
    if (val > 1) val /= 100;
    const commonNumers = [1, 2, 5, 10, 20];
    const commonDenoms = [3, 6, 9];
    for (let n of commonNumers) {
        for (let d of commonDenoms) {
            let divRes = n / d;
            if (Math.abs(val - divRes) < 0.01) return n + "/" + d;
        }
    }
    return false;
}

function gradeSwitchToWeightTypeFull() {
    $i("grade-weight-full").classList.add("active");
    $i("grade-weight-perc_entire").classList.remove("active");
    hidePercent();
    if (currWeightType == "perc_entire") {
        let wVal = parseWeightVal($i("grade-input-weight").value);
        if (!isNaN(wVal) || typeof wVal == "object") {
            $i("grade-input-weight").value = (typeof wVal == "object") ? (wVal.numer + "/" + wVal.denom) : (wVal / 100);
        }
    }
    currWeightType = "fullgrade";
}
function gradeSwitchToWeightTypePercEntire() {
    $i("grade-weight-full").classList.remove("active");
    $i("grade-weight-perc_entire").classList.add("active");
    showPercent();
    if (currWeightType == "fullgrade") {
        let wVal = parseWeightVal($i("grade-input-weight").value);
        if (!isNaN(wVal) || typeof wVal == "object") {
            $i("grade-input-weight").value = (typeof wVal == "object") ? (wVal.numer + "/" + wVal.denom) : (wVal * 100);
        }
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
    $i("grade-form").classList.remove("validate");
    $i("grade-input-title").focus();
    $i("grade-form-title").innerHTML = $esc(config.title) || "";
    $i("grade-input-title").value = config.gradeName || "";
    let gradeVal = (config.gradeVal == undefined) ? "" : config.gradeVal;
    if (config.gradeType && config.gradeType == "bonus") {
        $i("grade-input-bonus").value = gradeVal;
        gradeSwitchToTypeBonus();
    } else {
        $i("grade-input-grade").value = gradeVal;
        gradeSwitchToTypeExam();
    }
    let weightVal = (config.weightVal == undefined) ? "" : config.weightVal;
    if (config.weightType && config.weightType == "perc_entire") {
        gradeSwitchToWeightTypePercEntire();
        $i("grade-input-weight").value = (weightVal.includes("/")) ? weightVal : (weightVal * 100);
    } else {
        gradeSwitchToWeightTypeFull();
        $i("grade-input-weight").value = weightVal;
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
        grEditPromise = {
            res: res,
            rej: () => rej("cancel")
        };
    });
}

export function showModal(config) {
    show("simple-modal");
    $i("modal-title").innerHTML = config.title || "";
    $i("modal-subtext").innerHTML = config.subtext || "";
    $i("modal-input").style.display = config.input ? "" : "none";
    $i("modal-no").innerHTML = config.noText || "";
    $i("modal-yes").innerHTML = config.yesText || "";

    $i("details-overlay").style.display = "none";
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
    if (grEditPromise) grEditPromise.rej();
    grEditPromise = null;
}