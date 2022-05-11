import { $c, $i, $sa, $esc, $s } from "./gymial.helper.js";

import { getGradeData, setGradeData, getGradeLastMod } from "./gymial.store.js";

import * as templ from "./gymial.templates.js";

import * as g_detail from "./gymial.detail.js";

let viewState = {
    viewPluspoints: false,
    gradeData: {},
    context: {}
};

export function init() {
    $i("grades-save-cloud-spinner").style.display = "none";

    $i("grades-reset-all").addEventListener("click", () => {
        if (confirm("Willst du wirklich alle Noten löschen? Dies kann nicht rückgängig gemacht werden!")) {
            setGradeData({});
            viewState.gradeData = {};
            refreshGrades();
        }
    });

    $i("grades-save-cloud").addEventListener("click", async () => {
        try {
            $i("grades-save-cloud").style.display = "none";
            $i("grades-save-cloud-spinner").style.display = "";
            let gradesReq = await fetch("/grades");
            if (gradesReq.status == 401) {
                throw new Error("401");
            }
            let gradesJSON = await gradesReq.json();
            alert(gradesJSON.lastmod + " " + getGradeLastMod());
            if (gradesJSON.lastmod > getGradeLastMod()) {
                viewState.gradeData = gradesJSON.data;
                setGradeData(viewState.gradeData);
            } else {
                gradesReq = await fetch("/grades", {
                    method: "post",
                    body: JSON.stringify(viewState.gradeData)
                });
                if (gradesReq.status == 401) {
                    throw new Error("401");
                }
            }
            refreshGrades();
        } catch (e) {}
        $i("grades-save-cloud").style.display = "";
        $i("grades-save-cloud-spinner").style.display = "none";
    });

    viewState.gradeData = getGradeData();
    refreshGrades();
}

// helper functions

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
    return rounded;
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
    let avgs = Object.keys(data).map(subj => calculateGradesAvg(data[subj])).filter(g => !isNaN(g));
    return avgs.reduce((a, v) => a + v, 0) / avgs.length;
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

function getTypeFromContext(context) {
    if (context.grade) return "grade";
    if (context.subj) return "subj";
    if (context.sem) return "sem";
    return "sem_overview"; // unused
}

function getCurrContextEl(context) {
    if (context.grade) return context.grade[context.grade.length - 1];
    if (context.subj) return context.subj;
    if (context.sem) return context.sem;
    return {};
}

function pushContext(context, parentEl, selEl) {
    if (context.subj) {
        if (!context.grade) context.grade = [];
        context.grade.push({ "name": selEl.dataset.name, "index": selEl.dataset.index, "selEl": selEl, "contEl": parentEl });
    } else if (context.sem) {
        context.subj = { "name": selEl.dataset.name, "selEl": selEl, "contEl": parentEl };
    } else {
        context.sem = { "name": selEl.dataset.name, "selEl": selEl, "contEl": parentEl };
    }
    return context;
}

function popContext(context) {
    if (context.grade) {
        if (context.grade.length > 1) {
            context.grade.pop();
            return;
        }
        delete context.grade;
    } else if (context.subj) {
        delete context.subj;
    } else {
        delete context.sem;
    }
}

function getAtContext(data, context) {
    let curr = data;
    let indices = [];
    if (context.sem) indices.push(context.sem.name);
    if (context.subj) indices.push(context.subj.name);
    if (context.grade) indices.push(...context.grade.map(e => e.index), "value");
    for (let i = 0; i < indices.length; i++) curr = curr[indices[i]];
    return curr;
}

function deleteAtContext(data, context) {
    let curr = data;
    let indices = [];
    if (context.sem) indices.push(context.sem.name);
    if (context.subj) indices.push(context.subj.name);
    if (context.grade) indices.push(...context.grade.map(e => e.name));
    for (let i = 0; i < indices.length - 1; i++) curr = curr[indices[i]];
    delete curr[indices[indices.length - 1]];
}

function addGrade(context, gradeData, newGrade) {
    let c = getAtContext(gradeData, context);
    c.push({});
    for (let prop in newGrade) {
        c[c.length - 1][prop] = newGrade[prop];
    }
}

function editGrade(context, gradeData, newGrade) {
    let c = getAtContext(gradeData, context);
    for (let prop in newGrade) {
        c[context.selected][prop] = newGrade[prop];
    }
}

let animPlaying = false;

function refreshGrades() {
    $i("main-grades-content").innerHTML = getSemesterList(viewState.gradeData);

    for (let e of $sa("#main-grades-content .grades-sem-container")) {
        e.addEventListener("click", () => clickOnCont(e));
    }
    
    let addSemBtn = $s("#main-grades-content .grades-add-sem");
    registerClickAddBtn(addSemBtn, $i("grades-sems-cont"), name => {
        name = name.trim();
        if (name == "") return false;
        let sems = getAtContext(viewState.gradeData, viewState.context);
        if (sems[name]) {
            alert("Dieses Semester besteht schon!");
            return false;
        }
        sems[name] = {};
        setGradeData(viewState.gradeData);
        return true;
    });

    // semester view, subject view, etc.
    let ctx = viewState.context;
    let currCtx = {};
    if (ctx.sem) {
        let btns = Array(...$i("main-grades-content").getElementsByClassName("grades-sem-container"));
        let selBtn = btns.find(e => e.dataset.name == ctx.sem.name);
        selBtn.classList.add("growing");
        ctx.sem.selEl = selBtn;
        
        currCtx.sem = ctx.sem;
        showGradeList(currCtx);
    }
    if (ctx.subj) {
        let btns = Array(...ctx.sem.contEl.getElementsByClassName("grades-subj-container"));
        let selBtn = btns.find(e => e.dataset.name == ctx.subj.name);
        selBtn.classList.add("growing");
        ctx.subj.selEl = selBtn;
        
        currCtx.subj = ctx.subj;
        showGradeList(currCtx);
    }
    if (ctx.grade) {
        let prevCont = ctx.subj.contEl;
        currCtx.grade = [];
        for (let g of ctx.grade) {
            let btns = Array(...prevCont.getElementsByClassName("grades-grade-container"));
            let selBtn = btns.find(e => e.dataset.index == g.index);
            selBtn.classList.add("growing");
            g.selEl = selBtn;
            
            currCtx.grade.push(g);
            showGradeList(currCtx);

            prevCont = g.contEl;
        }
    }
}

function clickOnCont(selEl) {
    if (animPlaying) return;
    if (selEl.dataset.index && !selEl.classList.contains("grades-subgrade")) {
        // atomic grade, open editor
        let grade = getAtContext(viewState.gradeData, viewState.context)[selEl.dataset.index];
        viewState.context.selected = selEl.dataset.index;
        g_detail.showGradeEditor({
            "title": "Note bearbeiten",
            "gradeName": grade.title,
            "gradeType": grade.grade_type,
            "gradeVal": grade.value,
            "weightType": grade.weight_type,
            "weightVal": (grade.frac_weight) ? (grade.frac_weight.numer + "/" + grade.frac_weight.denom) : grade.weight
        }).then(r => {
            editGrade(viewState.context, viewState.gradeData, r);
            setGradeData(viewState.gradeData);
            refreshGrades();
        }).catch(() => {});
        return;
    }

    let glEl = document.createElement("div");
    glEl.classList.add("grades-cont");
    pushContext(viewState.context, glEl, selEl);
    showGradeList(viewState.context);
    $i("panel-grades").appendChild(glEl);

    animPlaying = true;
    selEl.closest(".grades-cont").classList.add("growing");
    selEl.classList.add("growing");
    setTimeout(() => { animPlaying = false; }, 250);
}

function closeCurrView(context) {
    let ctxEl = getCurrContextEl(context);
    let thisCont = ctxEl.contEl;
    let parentCont = ctxEl.selEl.closest(".grades-cont");
    ctxEl.contEl.classList.add("fade-out");
    ctxEl.selEl.classList.remove("growing");
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
        btn.classList.remove("adding");
    }, false);

    cont.querySelector(".grades-confirm-add-cont").addEventListener("click", () => {
        if (cb(btnInput.value)) {
            refreshGrades();
        }
    });
}

function showGradeList(context) {
    let ctxEl = getCurrContextEl(context);
    let glEl = ctxEl.contEl;
    glEl.innerHTML = getSubjList(
        getAtContext(viewState.gradeData, context),
        ctxEl.name,
        getTypeFromContext(context)
    );

    glEl.querySelector(".grades-delete-link").addEventListener("click", () => {
        if (confirm("Wirklich löschen?")) {
            deleteAtContext(viewState.gradeData, viewState.context);
            closeCurrView(context);
            popContext(context);
            refreshGrades();
        }
    });
    
    glEl.querySelector(".grades-back-btn").addEventListener("click", () => {
        if (animPlaying) return;
        animPlaying = true;
        closeCurrView(viewState.context);
        popContext(viewState.context);
    });

    let addSubjBtn = glEl.querySelector(".grades-add-subj");
    if (addSubjBtn) registerClickAddBtn(addSubjBtn, glEl, name => {
        name = name.trim();
        if (name == "") return false;
        let subjs = getAtContext(viewState.gradeData, viewState.context);
        if (subjs[name]) {
            alert("Dieses Fach besteht schon!");
            return false;
        }
        subjs[name] = [];
        setGradeData(viewState.gradeData);
        return true;
    });
    let addGradeBtn = glEl.querySelector(".grades-add-grade");
    if (addGradeBtn) {
        addGradeBtn.addEventListener("click", () => {
            g_detail.showGradeEditor({
                "title": "Note hinzufügen",
                "gradeType": "regular",
                "weightType": "fullgrade"
            }).then(r => {
                addGrade(viewState.context, viewState.gradeData, r);
                setGradeData(viewState.gradeData);
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
                hideGradeEntry: true
            }).then(r => {
                addGrade(viewState.context, viewState.gradeData, {
                    "title": r.title,
                    "grade_type": "subgrade",
                    "value": [],
                    "weight_type": r.weight_type,
                    "weight": r.weight
                });
                setGradeData(viewState.gradeData);
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

function genSemOverviewContainer(topClass, title, avg) {
    let fAvg = formatGrade(avg, false);
    return templ.gradeSemContainer(topClass, $esc(title), roundedAvg(avg, true), fAvg, getGradeColor(avg));
}

function genGradeOverviewContainer(topClass, title, avg, plusPoints) {
    let fAvg = formatGrade(avg, false);
    let rAvg = roundedAvg(avg, plusPoints);
    return templ.gradeSubjContainer(topClass, $esc(title), fAvg, rAvg, getGradeColor(avg));
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
    let subgradeClass = (grade.grade_type == "subgrade") ? "grades-subgrade" : "";
    return templ.gradeGradeContainer(
        "grades-grade-container " + subgradeClass, index,
        $esc(grade.title), weightAsHTML(grade), fAvg, getGradeColor(fAvg)
    );
}

function getSemesterList(data) {
    let html = "";
    for (let sem in data) {
        html += genSemOverviewContainer("grades-sem-container", sem, calculateSemAvg(data[sem]));
    }
    return templ.gradeListSem(html);
}

function getSubjList(data, title, parentType) {
    let html = "";
    let avg;
    if (parentType == "sem") {
        avg = calculateSemAvg(data);
        let subjGroups = subjectCategories.map(e => ({"title": e, "grades": [], "html": ""}));
        for (let subj in data) {
            let catName = (subjects[subj]) ? subjects[subj].category : "Andere";
            let categoryID = subjectCategories.indexOf(catName);
            subjGroups[categoryID].grades.push(data[subj]);
            subjGroups[categoryID].html += genGradeOverviewContainer("grades-subj-container", subj, calculateGradesAvg(data[subj]), viewState.viewPluspoints);
        }
    
        for (let i = 0; i < subjGroups.length; i++) {
            let subjGroup = subjGroups[i];
            if (subjGroup.grades.length > 0) {
                let groupAvg = formatGrade(calculateGradesAvg(subjGroup.grades.map(grade => {
                    return {
                        "title": "",
                        "grade_type": "subgrade",
                        "weight_type": "fullgrade",
                        "weight": 1,
                        "value": grade
                    };
                })), false);
                html += templ.gradeGroup(subjGroup.title, groupAvg, subjGroup.html);
            }
        }
    } else {
        avg = calculateGradesAvg(data);
        for (let i = 0; i < data.length; i++) {
            let grade = data[i];
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
    return templ.gradeList(linkList, title, formatGrade(avg, false), parentType, html);
}

// constants

const subjectCategories = [
    "Sprachen",
    "Naturwissenschaften",
    "Geisteswissenschaften",
    "Wirtschaftsfächer",
    "Andere"
];

const subjects = {
    "Anwendungen des Computers": {
        "short_name": "AC",
        "category": "Andere"
    },
    "Anwendungen der Mathematik": {
        "short_name": "AM",
        "category": "Naturwissenschaften"
    },
    "Biologie": {
        "short_name": "B",
        "category": "Naturwissenschaften"
    },
    "Bildnerisches Gestalten": {
        "short_name": "BG",
        "category": "Andere"
    },
    "Chemie": {
        "short_name": "C",
        "category": "Naturwissenschaften"
    },
    "Deutsch": {
        "short_name": "D",
        "category": "Sprachen"
    },
    "Englisch": {
        "short_name": "E",
        "category": "Sprachen"
    },
    "Einführung Wirtschaft": {
        "short_name": "EW",
        "category": "Wirtschaftsfächer"
    },
    "Einführung Wirtschaft und Recht": {
        "short_name": "EWR",
        "category": "Wirtschaftsfächer"
    },
    "Französisch": {
        "short_name": "F",
        "category": "Sprachen" 
    },
    "Freifach": {
        "short_name": "FF",
        "category": "Andere"
    },
    "Finanzen": {
        "short_name": "FIN",
        "category": "Wirtschaftsfächer"
    },
    "Geographie": {
        "short_name": "GG",
        "category": "Geisteswissenschaften"
    },
    "Geschichte": {
        "short_name": "G",
        "category": "Geisteswissenschaften"
    },
    "Griechisch": {
        "short_name": "GR",
        "category": "Sprachen" 
    },
    "Italienisch": {
        "short_name": "IT",
        "category": "Sprachen" 
    },
    "Latein": {
        "short_name": "L",
        "category": "Sprachen"  
    },
    "Mathematik": {
        "short_name": "M",
        "category": "Naturwissenschaften"  
    },
    "Mensch und Arbeit": {
        "short_name": "M+A",
        "category": "Wirtschaftsfächer"
    },
    "Musik": {
        "short_name": "MU",
        "category": "Andere" 
    },
    "Physik": {
        "short_name": "P",
        "category": "Naturwissenschaften"  
    },
    "Recht": {
        "short_name": "R",
        "category": "Wirtschaftsfächer"  
    },
    "Religion": {
        "short_name": "RL",
        "category": "Geisteswissenschaften" 
    },
    "Rechnungswesen": {
        "short_name": "RW",
        "category": "Wirtschaftsfächer" 
    },
    "Spanisch": {
        "short_name": "SP",
        "category": "Sprachen" 
    },
    "Turnen": {
        "short_name": "T",
        "category": "Andere"  
    },
    "Volkswirtschaftslehre": {
        "short_name": "VWL",
        "category": "Wirtschaftsfächer"
    }
};

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