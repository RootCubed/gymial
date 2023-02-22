import { $c, $i, $sa, $esc, $s } from "./gymial.helper.js";

import {
    getGradeData, setGradeData,
    getGradeLastMod,
    getGradeSyncMode, setGradeSyncMode, getGradeLastSync, setGradeSynced
} from "./gymial.store.js";

import * as g_subj from "./gymial.subjects.js";
import * as g_detail from "./gymial.detail.js";

import * as templ from "./gymial.templates.js";

class Context {

    constructor(ctx) {
        if (ctx === undefined) {
            this.ctx = [];
        } else {
            this.ctx = JSON.parse(JSON.stringify(ctx));
        }
    }

    get type() {
        switch (this.ctx.length) {
            case 0:
                return "sem_overview";
            case 1:
                return "sem";
            case 2:
                return "subj";
            default:
                return "grade";
        }
    }
    
    getCurrEl() {
        if (this.ctx.length == 0) return {};
        return this.ctx[this.ctx.length - 1];
    }
    
    push(parentEl, selEl) {
        this.ctx.push({ "index": selEl.dataset.index, "selEl": selEl, "contEl": parentEl });
    }
    
    pop() {
        if (this.ctx.length > 0) {
            return this.ctx.pop();
        }
        return null;
    }
    
    getForData(data) {
        let curr = { value: data };
        let indices = this.ctx.map(e => e.index);
        for (let i = 0; i < indices.length; i++) curr = curr.value[indices[i]];
        return curr;
    }
    
    removeForData(data) {
        let curr = { value: data };
        let indices = this.ctx.map(e => e.index);
        for (let i = 0; i < indices.length - 1; i++) curr = curr.value[indices[i]];
        let lastIndex = indices[indices.length - 1];
        curr.value.splice(lastIndex, 1);
    }
    
    addGrade(gradeData, newGrade) {
        let c = this.getForData(gradeData).value;
        c.push({});
        for (let prop in newGrade) {
            c[c.length - 1][prop] = newGrade[prop];
        }
    }
    
    editGrade(index, gradeData, newGrade) {
        let c = this.getForData(gradeData).value;
        for (let prop in newGrade) {
            c[index][prop] = newGrade[prop];
        }
    }
}

let viewState = {
    viewPluspoints: false,
    gradeData: [],
    context: new Context()
};

function repaintSyncSettings(loggedIn) {
    $i("grade-cloud-spinner").style.display = "none";
    if (!loggedIn) {
        $i("grade-sync-must-login").style.display = "";
        $i("grade-sync-mode-cont").style.display = "none";
        $i("grade-auto-sync-cont").style.display = "none";
        $i("grade-manual-sync-cont").style.display = "none";
        return;
    }
    $i("grade-sync-must-login").style.display = "none";
    $i("grade-sync-mode-cont").style.display = "";
    if (getGradeSyncMode() == "auto") {
        $i("grade-auto-sync-cont").style.display = "";
        $i("grade-manual-sync-cont").style.display = "none";
        $i("grade-auto-sync").classList.add("active");
        $i("grade-manual-sync").classList.remove("active");
    } else {
        $i("grade-auto-sync-cont").style.display = "none";
        $i("grade-manual-sync-cont").style.display = "";
        $i("grade-auto-sync").classList.remove("active");
        $i("grade-manual-sync").classList.add("active");
    }
}

export function init() {
    $i("grade-cloud-spinner").style.display = "none";

    $i("grade-dl-cloud").addEventListener("click", async () => {
        $i("grade-cloud-spinner").style.display = "";
        $i("grade-manual-sync-cont").style.display = "none";
        try {
            const startTime = Date.now();
            let gradesReq = await fetch("/grades");
            if (gradesReq.status == 401) {
                throw new Error("401");
            }
            let gradesJSON = await gradesReq.json();
            viewState.gradeData = gradesJSON.data;
            setGradeData(viewState.gradeData);
            refreshGrades();
            if (Date.now() - startTime < 500) {
                setTimeout(() => repaintSyncSettings(true), 500 - (Date.now() - startTime));
            } else {
                repaintSyncSettings(true);
            }
        } catch (e) {
            g_detail.showPwForm();
            repaintSyncSettings(false);
        }
    });

    $i("grade-ul-cloud").addEventListener("click", async () => {
        $i("grade-cloud-spinner").style.display = "";
        $i("grade-manual-sync-cont").style.display = "none";
        try {
            const startTime = Date.now();
            let gradesReq = await fetch("/grades", {
                method: "POST",
                body: JSON.stringify(viewState.gradeData)
            });
            if (gradesReq.status == 401) {
                throw new Error("401");
            }
            if (Date.now() - startTime < 500) {
                setTimeout(() => repaintSyncSettings(true), 500 - (Date.now() - startTime));
            } else {
                repaintSyncSettings(true);
            }
        } catch (e) {
            g_detail.showPwForm();
            repaintSyncSettings(false);
        }
    });

    $i("grade-sync-cloud-now").addEventListener("click", async () => {
        $i("grade-auto-sync-cont").style.display = "none";
        cloudSyncAuto();
        viewState.gradeData = getGradeData().data;
        refreshGrades();
    });

    $i("grade-auto-sync").addEventListener("click", () => {
        setGradeSyncMode("auto");
        repaintSyncSettings(true);
    });
    
    $i("grade-manual-sync").addEventListener("click", () => {
        setGradeSyncMode("manual");
        repaintSyncSettings(true);
    });

    repaintSyncSettings(false);

    if (getGradeSyncMode() == "auto") {
        cloudSyncAuto();
    } else {
        viewState.gradeData = getGradeData();
    }
    refreshGrades();
}

export function onLogin() {
    repaintSyncSettings(true);
}

export function onLogout() {
    repaintSyncSettings(false);
}

// helper functions

function setGradeDataWithSync(data) {
    setGradeData(data);
    if (getGradeSyncMode() == "auto") {
        cloudSyncAuto();
    }
}

async function cloudSyncAuto() {
    const startTime = Date.now();
    try {
        $i("grade-cloud-spinner").style.display = "";
        let gradesReq = await fetch("/grades");
        if (gradesReq.status == 401) {
            throw new Error("401");
        }
        let gradesJSON = await gradesReq.json();
        if (gradesJSON.lastmod > getGradeLastMod()) {
            viewState.gradeData = gradesJSON.data;
            setGradeData(viewState.gradeData);
            // make sure that we are not in an invalid state
            while (viewState.context.ctx.length > 0) {
                closeCurrView(viewState.context);
            }
        } else {
            gradesReq = await fetch("/grades", {
                method: "post",
                body: JSON.stringify({
                    data: viewState.gradeData,
                    lastmod: getGradeLastMod()
                })
            });
            if (gradesReq.status == 401) {
                throw new Error("401");
            }
        }
        setGradeSynced();
        if (Date.now() - startTime < 500) {
            setTimeout(() => repaintSyncSettings(true), 500 - (Date.now() - startTime));
        } else {
            repaintSyncSettings(true);
        }
    } catch (e) {
        // fallback: localStorage
        viewState.gradeData = getGradeData().data;
        repaintSyncSettings(false);
    }
    refreshGrades();
    $i("grade-sync-info-last-cont").innerHTML = new Date(getGradeLastSync()).toLocaleTimeString([], {
        year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
}

const getGradeColor = grade => {
    let g = parseFloat(grade);
    return "#" + ((g < 1.0) ? getGradeColor(1.0) : (g > 6.0) ? getGradeColor(6.0) : gradeColors[(roundedAvg(g, false) - 1) * 2]);
};

function formatGrade(grade, isBonus) {
    if (isBonus) return ((grade >= 0) ? "+" : "") + (Number.isInteger(grade) ? (grade + ".0") : formatGrade(grade, false));
    if (isNaN(grade)) return "-";
    return Math.floor(grade * 100) / 100; // floor so that e.g. 4.24999 doesn't get shown as 4.25
}

function roundedAvg(grade, plusPoints) {
    if (isNaN(grade) || grade == "-") return "-";
    let rounded = Math.round(grade * 2) / 2;
    if (plusPoints) {
        let pp = (rounded > 4) ? (rounded - 4) : (4 - rounded) * -2;
        return (pp >= 0 ? "+" : "") + pp.toFixed(1);
    }
    return rounded.toFixed(1);
}

function weightAsHTML(grade) {
    if (grade.grade_type == "bonus") return "(Bonusnote)";
    let type = grade.weight_type;
    let weight = grade.weight;
    if (weight == 0) return "zählt nicht";
    if (grade.frac_weight) {
        return templ.weightSpan("Gewicht: ", grade.frac_weight, (type == "fullgrade") ? " einer ganzen Note" : " der Zeugnisnote");
    }
    switch (type) {
        case "fullgrade":
            if (weight == 0.5) return "zählt halb";
            if (weight == 1) return "zählt ganz";
            if (weight == 2) return "zählt doppelt";
            return "Gewicht: " + Math.round(weight * 100) / 100;
        case "perc_entire":
            return "Gewicht: " + Math.round(weight * 100 * 100) / 100 + "% der Zeugnisnote";
    }
}

function calculateSemAvg(data) {
    let avgs = data.map(subj => calculateGradesAvg(subj.value)).filter(g => !isNaN(g));
    return avgs.reduce((a, v) => a + v, 0) / avgs.length;
}

function calculateSemPlusPoints(data) {
    let pps = data.map(subj => calculateGradesAvg(subj.value)).filter(g => !isNaN(g));
    let ppRes = pps.reduce((a, v) => a + parseInt(roundedAvg(v, true)), 0);
    return (ppRes >= 0 ? "+" : "") + ppRes.toFixed(1);
}

function calculateGradesAvg(data) {
    // recursively calculate subgrades
    let gradesCalc = data.map(grade => {
        let res = Object.assign({}, grade);
        if (grade.grade_type == "subgrade") {
            let avg = calculateGradesAvg(grade.value);
            if (isNaN(avg)) return null;
            res.value = avg;
            res.grade_type = "regular";
        }
        if (res.frac_weight) {
            res.weight = res.frac_weight.numer / res.frac_weight.denom;
        }
        return res;
    }).filter(grade => grade != null);
    
    if (gradesCalc.length == 0) return NaN;

    // calculate regular grades, taking into account subgrades
    let regGrades = gradesCalc.filter(grade => grade.grade_type == "regular" && grade.weight_type == "fullgrade");
    let regGradesWSum = regGrades.reduce((a, v) => a + v.weight, 0);
    let regGradesAvg = regGrades.reduce((a, v) => a + v.value * v.weight, 0) / regGradesWSum;

    // calculate grades with perc_entire, taking into account subgrades
    let percEntireGrades = gradesCalc.filter(grade => grade.grade_type == "regular" && grade.weight_type == "perc_entire");
    let percEntireProp = percEntireGrades.reduce((a, v) => a + v.weight, 0);
    let percEntireGradesAvg = 0;
    if (percEntireGrades.length > 0) {
        percEntireGradesAvg = percEntireGrades.reduce((a, v) => a + v.value * v.weight, 0) / percEntireProp;
    }

    // calculate bonus grades
    let bonusGrades = gradesCalc.filter(grade => grade.grade_type == "bonus");
    let bonusSum = bonusGrades.reduce((a, v) => a + v.value, 0);

    if (regGradesWSum == 0 && percEntireProp == 0) return NaN;

    if (regGradesWSum == 0) {
        return percEntireGradesAvg + bonusSum;
    }

    return percEntireGradesAvg * percEntireProp + regGradesAvg * (1 - percEntireProp) + bonusSum;
}

let animPlaying = false;

function refreshGrades() {
    $i("main-grades-content").innerHTML = getSemesterList(viewState.gradeData);

    for (let e of $sa("#main-grades-content .grades-sem-container")) {
        e.addEventListener("click", () => clickOnCont(e));
    }
    
    let addSemBtn = $s("#main-grades-content .grades-add-sem");
    registerClickAddBtn(addSemBtn, $i("grades-sems-cont"), async name => {
        name = name.trim();
        if (name == "") return false;
        let sems = viewState.context.getForData(viewState.gradeData);
        sems.value.push({ name: name, value: [] });
        setGradeDataWithSync(viewState.gradeData);
        return true;
    });

    // semester view, subject view, etc.
    let ctx = viewState.context.ctx;
    let currCtx = new Context();
    if (ctx.length > 0) {
        let btns = Array(...$i("main-grades-content").getElementsByClassName("grades-sem-container"));
        let selBtn = btns.find(e => e.dataset.index == ctx[0].index);
        selBtn.classList.add("growing");

        ctx[0].selEl = selBtn;
        currCtx.ctx.push(ctx[0]);
        showGradeList(currCtx);
    }
    if (ctx.length > 1) {
        let btns = Array(...ctx[0].contEl.getElementsByClassName("grades-subj-container"));
        let selBtn = btns.find(e => e.dataset.index == ctx[1].index);
        selBtn.classList.add("growing");

        ctx[1].selEl = selBtn;
        currCtx.ctx.push(ctx[1]);
        showGradeList(currCtx);
    }
    if (ctx.length > 2) {
        let prevCont = ctx[1].contEl;
        for (let g of ctx.slice(2)) {
            let btns = Array(...prevCont.getElementsByClassName("grades-grade-container"));
            let selBtn = btns.find(e => e.dataset.index == g.index);
            selBtn.classList.add("growing");

            g.selEl = selBtn;
            currCtx.ctx.push(g);
            showGradeList(currCtx);

            prevCont = g.contEl;
        }
    }
}

function clickOnCont(selEl) {
    if (animPlaying) return;
    if (selEl.classList.contains("grades-reggrade")) {
        // atomic grade, open editor
        let grade = viewState.context.getForData(viewState.gradeData).value[selEl.dataset.index];
        let selIndex = selEl.dataset.index;
        g_detail.showGradeEditor({
            title: "Note bearbeiten",
            gradeName: grade.name,
            gradeType: grade.grade_type,
            gradeVal: grade.value,
            weightType: grade.weight_type,
            weightVal: (grade.frac_weight) ? (grade.frac_weight.numer + "/" + grade.frac_weight.denom) : grade.weight,
            showDelete: true
        }).then(r => {
            if (r.wants_delete) {
                let dat = viewState.context.getForData(viewState.gradeData);
                dat.value.splice(selIndex, 1);
            } else {
                viewState.context.editGrade(selIndex, viewState.gradeData, r.data);
            }
            setGradeDataWithSync(viewState.gradeData);
            refreshGrades();
        });
        return;
    }

    let glEl = document.createElement("div");
    glEl.classList.add("grades-cont");
    viewState.context.push(glEl, selEl);
    showGradeList(viewState.context);
    $i("panel-grades").appendChild(glEl);

    animPlaying = true;
    selEl.closest(".grades-cont").classList.add("growing");
    selEl.classList.add("growing");
    setTimeout(() => { animPlaying = false; }, 250);
}

function closeCurrView(context) {
    let ctxEl = context.getCurrEl();
    let thisCont = ctxEl.contEl;
    let parentCont = ctxEl.selEl.closest(".grades-cont");
    ctxEl.contEl.classList.add("fade-out");
    ctxEl.selEl.classList.remove("growing");
    context.pop();
    setTimeout(() => {
        thisCont.remove();
        parentCont.classList.remove("growing");
        animPlaying = false;
    }, 250);
}

function registerClickAddBtn(btn, cont, cb) {
    let btnInput = btn.querySelector("input");
    btn.addEventListener("click", () => {
        btn.classList.add("adding");
        btnInput.focus();
    });

    btnInput.addEventListener("keyup", ev => {
        if (ev.key == "Escape") {
            cont.click();
        }
        if (ev.key == "Enter") {
            cont.querySelector(".grades-confirm-add-cont").click();
        }
    });

    cont.addEventListener("click", ev => {
        if (btn.contains(ev.target)) return;
        btnInput.value = "";
        btn.classList.remove("adding");
    }, false);

    cont.querySelector(".grades-confirm-add-cont").addEventListener("click", async () => {
        let res = await cb(btnInput.value);
        if (res) {
            refreshGrades();
        }
    });
}

function showGradeList(context) {
    let ctxEl = context.getCurrEl();
    let glEl = ctxEl.contEl;
    glEl.innerHTML = getSubjList(
        context.getForData(viewState.gradeData),
        context.type
    );

    glEl.querySelector(".grades-delete-link").addEventListener("click", () => {
        g_detail.showModal({
            title: `"${ctxEl.selEl.dataset.name}" wirklich löschen?`,
            subtext: "",
            input: false,
            noText: "Abbrechen",
            yesText: "Löschen"
        }).then(() => {
            viewState.context.removeForData(viewState.gradeData);
            closeCurrView(viewState.context);
            setGradeDataWithSync(viewState.gradeData);
            refreshGrades();
        });
    });
    
    let rnLink = glEl.querySelector(".grades-rename-link");
    if (rnLink) {
        rnLink.addEventListener("click", async () => {
            try {
                let resp = await g_detail.showModal({
                    title: `Semester ${ctxEl.selEl.dataset.name} umbenennen`,
                    subtext: "",
                    input: true,
                    noText: "Abbrechen",
                    yesText: "Bestätigen"
                });
                let curr = viewState.context.getForData(viewState.gradeData);
                curr.name = resp.input;
                setGradeDataWithSync(viewState.gradeData);
                closeCurrView(viewState.context);
                refreshGrades();
            } catch (e) {}
        });
    }
    
    glEl.querySelector(".grades-back-btn").addEventListener("click", () => {
        if (animPlaying) return;
        animPlaying = true;
        closeCurrView(viewState.context);
    });

    let addSubjBtn = glEl.querySelector(".grades-add-subj");
    let sr = glEl.querySelector(".grades-search-results");
    if (addSubjBtn) registerClickAddBtn(addSubjBtn, glEl, async name => {
        name = name.trim();
        if (name == "") return false;
        let foundSubj = g_subj.subjects.find(e => e.name == name);
        if (!foundSubj) {
            try {
                await g_detail.showModal({
                    title: `Unbekanntes Fach "${name}"`,
                    subtext: `OK, um das Fach trotzdem in der Kategorie "Andere" hinzuzufügen.`,
                    input: false,
                    noText: "Abbrechen",
                    yesText: "OK"
                });
            } catch(e) {
                // cancelled
                return;
            }
        }
        let subjs = viewState.context.getForData(viewState.gradeData);
        subjs.value.push({ name: name, value: [] });
        setGradeDataWithSync(viewState.gradeData);
        sr.innerHTML = "";
        return true;
    });
    if (addSubjBtn) {
        // Search handler
        let inputSubjName = glEl.querySelector(".grades-sem-add-form");
        inputSubjName.addEventListener("keyup", () => {
            let input = glEl.querySelector("input");
            let results = [];
            if (input.value.length > 0) {
                results = g_subj.subjects.filter(e => {
                    let lower = input.value.toLowerCase();
                    if (e.name.toLowerCase().startsWith(lower)) return true;
                    if (e.shortName.toLowerCase().includes(lower)) return true;
                    return false;
                });
            }
            if (results.length > 0) {
                sr.innerHTML = results
                    .map(e => `
                        <div class="grades-search-result" data="${e.name}">
                            <span class="grades-search-result-main">${e.name}</span>
                            <span class="grades-search-result-type">${e.category}</span>
                        </div>
                    `)
                    .join('\n');
            } else {
                sr.innerHTML = "";
            }
            glEl.querySelectorAll(".grades-search-result").forEach(sr => sr.addEventListener("click", () => {
                input.value = sr.getAttribute("data");
                addSubjBtn.querySelector(".grades-confirm-add-cont").click();
            }));
        });
    }
    let addGradeBtn = glEl.querySelector(".grades-add-grade");
    if (addGradeBtn) {
        addGradeBtn.addEventListener("click", () => {
            g_detail.showGradeEditor({
                title: "Note hinzufügen",
                gradeType: "regular",
                weightType: "fullgrade",
                showDelete: false
            }).then(r => {
                viewState.context.addGrade(viewState.gradeData, r.data);
                setGradeDataWithSync(viewState.gradeData);
                refreshGrades();
            }).catch(() => {});
        });
    }
    let addSubgradeBtn = glEl.querySelector(".grades-add-subgrade");
    if (addSubgradeBtn) {
        addSubgradeBtn.addEventListener("click", () => {
            g_detail.showGradeEditor({
                title: "Ordner hinzufügen",
                gradeType: "regular",
                weightType: "fullgrade",
                hideGradeEntry: true,
                showDelete: false
            }).then(r => {
                viewState.context.addGrade(viewState.gradeData, {
                    name: r.data.name,
                    grade_type: "subgrade",
                    value: [],
                    weight_type: r.data.weight_type,
                    weight: r.data.weight
                });
                setGradeDataWithSync(viewState.gradeData);
                refreshGrades();
            }).catch(() => {});
        });
    }
    
    glEl.querySelector(".grades-more-btn").addEventListener("click", () => {
        glEl.querySelector(".grades-more-btn").classList.toggle("active");
        glEl.querySelector(".grades-dropdown-more").classList.toggle("hidden");
    });
    
    glEl.addEventListener("click", ev => {
        if (
            glEl.querySelector(".grades-more-btn").contains(ev.target) ||
            glEl.querySelector(".grades-dropdown-more").contains(ev.target)
        ) return;
        glEl.querySelector(".grades-more-btn").classList.remove("active");
        glEl.querySelector(".grades-dropdown-more").classList.add("hidden");
    }, false);

    for (let child of glEl.getElementsByClassName("grades-overview-container")) {
        if (child.classList.contains("grades-add")) continue;
        child.addEventListener("click", () => clickOnCont(child));
    }
}

function genSemOverviewContainer(topClass, title, avg, plusPoints, index) {
    let fAvg = formatGrade(avg, false);
    return templ.gradeSemContainer(topClass, $esc(title), plusPoints, fAvg, getGradeColor(avg), index);
}

function genGradeOverviewContainer(topClass, title, avg, plusPoints, index) {
    let fAvg = formatGrade(avg, false);
    let rAvg = roundedAvg(avg, plusPoints);
    return templ.gradeSubjContainer(topClass, $esc(title), fAvg, rAvg, getGradeColor(avg), index);
}

function genGradeContainer(grade, index) {
    // use calculateGradesAvg in case it is a subgrade
    let gradeAvg = calculateGradesAvg([{
        grade_type: grade.grade_type,
        value: grade.value,
        weight_type: "fullgrade",
        weight: 1
    }]);
    let fAvg = formatGrade(gradeAvg, false);
    if (grade.grade_type == "bonus") {
        fAvg = formatGrade(grade.value, true);
    }
    let subgradeClass = (grade.grade_type == "subgrade") ? "grades-subgrade" : "grades-reggrade";
    return templ.gradeGradeContainer(
        "grades-grade-container " + subgradeClass,
        $esc(grade.name), weightAsHTML(grade), fAvg, getGradeColor(fAvg), index
    );
}

function getSemesterList(data) {
    let html = "";
    let i = 0;
    for (let sem of data) {
        html += genSemOverviewContainer("grades-sem-container", sem.name, calculateSemAvg(sem.value), calculateSemPlusPoints(sem.value), i);
        i++;
    }
    return templ.gradeListSem(html);
}

function getSubjList(data, parentType) {
    let html = "";
    let avg;
    let semData = data.value;
    if (parentType == "sem") {
        avg = calculateSemAvg(semData);
        let subjGroups = g_subj.categories.map(e => ({"title": e, "grades": [], "html": ""}));
        let i = 0;
        for (let subj of semData) {
            let subjName = subj.name;
            let subjCat = "";
            if (subjName.includes("$$")) {
                subjCat = subjName.split("$$")[1];
                subjName = subjName.split("$$")[0];
            }
            let foundSubj = g_subj.subjects.find(e => e.name == subjName);
            if (!foundSubj) foundSubj = {
                name: subjName,
                shortName: subjName,
                types: [],
                category: "Andere"
            };
            if (subjCat) {
                foundSubj.name = subjName;
                foundSubj.category = subjCat;
            }
            let categoryID = g_subj.categories.indexOf(foundSubj.category);
            subjGroups[categoryID].grades.push(subj.value);
            subjGroups[categoryID].html += genGradeOverviewContainer("grades-subj-container", subjName, calculateGradesAvg(subj.value), viewState.viewPluspoints, i);
            i++;
        }
    
        for (let i = 0; i < subjGroups.length; i++) {
            let subjGroup = subjGroups[i];
            if (subjGroup.grades.length > 0) {
                let groupAvg = formatGrade(calculateGradesAvg(subjGroup.grades.map(grade => {
                    return {
                        name: "",
                        grade_type: "subgrade",
                        weight_type: "fullgrade",
                        weight: 1,
                        value: grade
                    };
                })), false);
                html += templ.gradeGroup(subjGroup.title, groupAvg, subjGroup.html);
            }
        }
    } else {
        avg = calculateGradesAvg(semData);
        for (let i = 0; i < semData.length; i++) {
            let grade = semData[i];
            html += genGradeContainer(grade, i);
        }
    }
    let linkList = [];
    switch (parentType) {
        case "sem":
            linkList.push({ title: "Semester umbenennen", cl: "grades-rename-link" });
            linkList.push({ title: "Semester löschen", cl: "grades-delete-link" });
            break;
        case "subj":
            linkList.push({ title: "Fach löschen", cl: "grades-delete-link" });
            break;
        case "grade":
            linkList.push({ title: "Ordner bearbeiten", cl: "grades-rename-link" });
            linkList.push({ title: "Ordner löschen", cl: "grades-delete-link" });
            break;
    }
    return templ.gradeList(linkList, data.name.split("$$")[0], formatGrade(avg, false), parentType, html);
}

// constants

const gradeColors = [
    "F70E0E", // 1
    "E24412", // 1.5
    "EE571B", // 2
    "EA722A", // 2.5
    "DD9933", // 3
    "DDBA33", // 3.5
    "DFE616", // 4
    "BCD934", // 4.5
    "9BE35F", // 5
    "3EF746", // 5.5
    "36FF25", // 6
];