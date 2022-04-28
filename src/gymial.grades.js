import { $c, $i, $sa, $esc } from "./gymial.helper.js";

import { getGradeData } from "./gymial.store.js";

import * as templ from "./gymial.templates.js";

let viewState = {
    viewPluspoints: false
};

export function init() {
    reloadHTML();
}

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

// helper functions

const getGradeColor = grade => {
    let g = parseFloat(grade);
    return "#" + ((g < 1.0) ? getGradeColor(1.0) : (g > 6.0) ? getGradeColor(6.0) : gradeColors[(roundedAvg(g, false) - 1) * 2]);
};

function formatGrade(grade, isBonus) {
    if (isBonus) return ((grade >= 0) ? "+" : "") + grade.toString();
    if (isNaN(grade)) return "-";
    return Math.floor(grade * 100) / 100; // floor so that e.g. 4.24999 doesn't get shown as 4.25
}

function roundedAvg(grade, plusPoints) {
    if (isNaN(grade) || grade == "-") return "-";
    let rounded = Math.round(grade * 2) / 2;
    if (plusPoints) {
        return (rounded > 4) ? (rounded - 4) : (4 - rounded) * -2;
    }
    return rounded;
}

function weightAsString(grade) {
    if (grade.grade_type == "bonus") return "(Bonusnote)";
    let type = grade.weight_type;
    let weight = grade.weight;
    if (weight == 0) return "zählt nicht";
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
    let sum = 0;
    let count = 0;
    for (let subj in data) {
        let avg = calculateGradesAvg(data[subj]);
        if (!isNaN(avg)) {
            count++;
            sum += avg;
        }
    }
    return sum / count;
}

function calculateGradesAvg(data) {
    // recursively calculate subgrades
    let gradesCalc = data.map(grade => {
        switch (grade.grade_type) {
            case "regular":
                return grade;
            case "bonus":
                return grade;
            case "subgrade":
                let avg = calculateGradesAvg(grade.value);
                if (isNaN(avg)) return null;
                return {
                    "title": grade.title,
                    "grade_type": "regular",
                    "weight_type": grade.weight_type,
                    "weight": grade.weight,
                    "value": avg
                };
        }
    }).filter(grade => grade != null);
    
    if (gradesCalc.length == 0) return NaN;

    // calculate regular grades, taking into account subgrades
    let regGrades = gradesCalc.filter(grade => {
        return grade.grade_type == "regular" && grade.weight_type == "fullgrade";
    });
    let regGradesWSum = regGrades.reduce((a, v) => a + v.weight, 0);
    let regGradesAvg = regGrades.reduce((a, v) => a + v.value * v.weight, 0) / regGradesWSum;

    // calculate grades with perc_entire, taking into account subgrades
    let percEntireGrades = gradesCalc.filter(grade => {
        return grade.grade_type == "regular" && grade.weight_type == "perc_entire";
    });
    let percEntireProp = percEntireGrades.reduce((a, v) => a + v.weight, 0);
    if (percEntireProp > 1) alert("percEntireGrade over 100%");
    let percEntireGradesAvg = 0;
    if (percEntireGrades.length > 0) {
        percEntireGradesAvg = percEntireGrades.reduce((a, v) => a + v.value * v.weight, 0) / percEntireProp;
    }

    // calculate bonus grades
    let bonusGrades = gradesCalc.filter(grade => {
        return grade.grade_type == "bonus";
    });
    let bonusSum = bonusGrades.reduce((a, v) => a + v.value, 0);

    if (regGradesWSum == 0) {
        return percEntireGradesAvg + bonusSum;
    }

    return percEntireGradesAvg * percEntireProp + regGradesAvg * (1 - percEntireProp) + bonusSum;
}

let animPlaying = false;

function reloadHTML() {
    $i("main-grades-content").innerHTML = getSemesterList(getGradeData());
    for (let e of $sa("#main-grades-content .grades-sem-container")) {
        const semName = e.dataset.name;
        e.addEventListener("click", () => {
            if (animPlaying) return;
            showGradeList(getGradeData()[semName], semName, e, $i("grades-sems-cont"), "sem");
        });
    }
}

function showGradeList(data, title, clickedEl, parent, type) {
    let glEl = (type == "sem") ? getSubjList(data, title) : getGradeList(data, title, clickedEl.dataset.color, type);
    $i("panel-grades").appendChild(glEl);
    
    glEl.querySelector(".grades-back-btn").addEventListener("click", () => {
        if (animPlaying) return;
        animPlaying = true;
        glEl.classList.add("fade-out");
        clickedEl.classList.remove("growing");
        setTimeout(() => {
            glEl.remove();
            parent.classList.remove("growing");
            animPlaying = false;
        }, 250);
    });

    glEl.querySelector(".grades-more-btn").addEventListener("click", () => {
        glEl.querySelector(".grades-more-btn").classList.toggle("active");
        glEl.querySelector(".grades-dropdown-more").classList.toggle("hidden");
    });

    glEl.querySelector(".grades-delete-link").addEventListener("click", () => {
        if (confirm("Wirklich löschen?")) {
            // TODO
        }
    });

    for (let child of glEl.getElementsByClassName("grades-overview-container")) {
        child.addEventListener("click", () => {
            let t = child;
            if (t.classList.contains("grades-grade-container") && !t.classList.contains("grades-subgrade")) {
                alert("grade editor!");
                return;
            }
            if (t.dataset.index) {
                showGradeList(data[t.dataset.index].value, data[t.dataset.index].title, t, glEl, "grade");
            } else if (t.dataset.name) {
                showGradeList(data[t.dataset.name], t.dataset.name, t, glEl, "subj");
            }
        }, false);
    }

    animPlaying = true;
    parent.classList.add("growing");
    clickedEl.classList.add("growing");
    setTimeout(() => { animPlaying = false; }, 250);
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
    let fAvg = formatGrade(gradeAvg, grade.grade_type == "bonus");
    let subgradeClass = (grade.grade_type == "subgrade") ? "grades-subgrade" : "";
    return templ.gradeGradeContainer(
        "grades-grade-container " + subgradeClass, index,
        $esc(grade.title), weightAsString(grade), fAvg, getGradeColor(fAvg)
    );
}

function getSemesterList(data) {
    let html = `
<div class="grades-overview-container grades-add-sem">
    <span class="grades-overview-span">(Placeholder) +Semester</span>
</div>
`;
    for (let sem in data) {
        html += genGradeOverviewContainer("grades-sem-container", sem, calculateSemAvg(data[sem]), viewState.viewPluspoints);
    }
    return html;
}

function getSubjList(data, title) {
    let subjGroups = subjectCategories.map(e => ({"title": e, "grades": [], "html": ""}));
    for (let subj in data) {
        let catName = (subjects[subj]) ? subjects[subj].category : "Andere";
        let categoryID = subjectCategories.indexOf(catName);
        subjGroups[categoryID].grades.push(data[subj]);
        subjGroups[categoryID].html += genGradeOverviewContainer("grades-subj-container", subj, calculateGradesAvg(data[subj]), viewState.viewPluspoints, categoryID);
    }
    let fAvg = formatGrade(calculateSemAvg(data), false);

    let html = "";
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
    let divEl = document.createElement("div");
    divEl.classList.add("grades-cont");
    divEl.innerHTML = templ.gradeList([
        { title: "Semester umbenennen", cl: "grades-rename-link" },
        { title: "Semester löschen", cl: "grades-delete-link" }
    ], title, fAvg, "sem", html);
    return divEl;
}

function getGradeList(data, title, colorname, type) {
    let fAvg = formatGrade(calculateGradesAvg(data), false);
    let html = "";
    for (let i = 0; i < data.length; i++) {
        let grade = data[i];
        html += genGradeContainer(grade, i);
    }
    let divEl = document.createElement("div");
    divEl.classList.add("grades-cont", "grades-sg" + colorname);
    divEl.innerHTML = templ.gradeList([
        { title: "Semester umbenennen", cl: "grades-rename-link" },
        { title: "Semester löschen", cl: "grades-delete-link" }
    ], title, fAvg, "subj", html);
    return divEl;
}