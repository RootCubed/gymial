import { $c, $i, $sa, $esc } from "./gymial.helper.js";

import { getGradeData } from "./gymial.store.js";

let viewPluspoints = false;

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

const getGradeColor = grade => {
    let g = parseFloat(grade);
    return "#" + ((g < 1.0) ? getGradeColor(1.0) : (g > 6.0) ? getGradeColor(6.0) : gradeColors[(roundedAvg(g, false) - 1) * 2]);
};

let animPlaying = false;

export function init() {
    reloadHTML();
}

function reloadHTML() {
    $i("main-grades-content").innerHTML = getSemestersHTML(getGradeData());
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
        glEl.classList.remove("visible");
        setTimeout(() => {
            clickedEl.classList.remove("growing");
            glEl.remove();
            setTimeout(() => {
                parent.classList.remove("growing");
                animPlaying = false;
            }, 250);
        }, 100);
    });

    glEl.querySelector(".grades-more-btn").addEventListener("click", () => {
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
            if (t.dataset.name) {
                showGradeList(data[t.dataset.name], t.dataset.name, t, glEl, "subj");
            } else if (t.dataset.index) {
                showGradeList(data[t.dataset.index].value, data[t.dataset.index].title, t, glEl, "grade");
            }
        }, false);
    }

    animPlaying = true;
    parent.classList.add("growing");
    clickedEl.classList.add("growing");
    setTimeout(() => {
        glEl.classList.add("visible");
        animPlaying = false;
    }, 100);
}

function getGradeOverviewContainerHTML(topClass, title, avg, plusPoints, color) {
    avg = Math.floor(avg * 100) / 100; // floor so that e.g. 4.24999 doesn't get shown as 4.25
    let rounded = roundedAvg(avg, plusPoints);
    if (isNaN(avg)) {
        avg = "-";
        rounded = "-";
    }
    return `
<div class="grades-overview-container ${topClass}" data-name="${$esc(title)}" data-color="${color}">
    <span class="grades-overview-span grades-overview-title">${$esc(title)}</span>
    <span class="grades-overview-span grades-overview-avg has-avg-label">${avg}</span>
    <span class="grades-overview-span grades-overview-round-avg">${rounded}</span>
    <div class="grades-overview-vertbar" style="background-color: ${getGradeColor(avg)}"></div>
</div>
`;
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

function getGradeContainerHTML(grade, index, color) {
    // use calculateGradesAvg in case it is a subgrade
    let gradeAvg = calculateGradesAvg([{
        grade_type: grade.grade_type,
        value: grade.value,
        weight_type: "fullgrade",
        weight: 1
    }]);
    let rounded = Math.floor(gradeAvg * 100) / 100;
    if (isNaN(rounded)) {
        rounded = "-";
    }
    if (grade.grade_type == "bonus" && grade.value >= 0) {
        rounded = "+" + grade.value;
    }
    return `
<div class="grades-overview-container grades-grade-container ${(grade.grade_type == "subgrade") ? "grades-subgrade" : ""}"
data-index="${index}" data-color="${color}">
    <span class="grades-overview-span grades-overview-title">${$esc(grade.title)}</span>
    <span class="grades-overview-span grades-overview-weight">${weightAsString(grade)}</span>
    <span class="grades-overview-span grades-overview-grade">${rounded}</span>
    <div class="grades-overview-vertbar" style="background-color: ${getGradeColor(rounded)}"></div>
</div>
`;
}

function getSemestersHTML(data) {
    let html = `
<div class="grades-overview-container grades-add-sem">
    <span class="grades-overview-span">+</span>
</div>
`;
    for (let sem in data) {
        html += getGradeOverviewContainerHTML("grades-sem-container", sem, calculateSemAvg(data[sem]), viewPluspoints);
    }
    return html;
}

function getSubjList(data, title) {
    let subjGroups = subjectCategories.map(e => ({"title": e, "grades": [], "html": ""}));
    for (let subj in data) {
        let catName = (subjects[subj]) ? subjects[subj].category : "Andere";
        let categoryID = subjectCategories.indexOf(catName);
        subjGroups[categoryID].grades.push(data[subj]);
        subjGroups[categoryID].html += getGradeOverviewContainerHTML("grades-subj-container", subj, calculateGradesAvg(data[subj]), viewPluspoints, categoryID);
    }
    let avg = Math.floor(calculateSemAvg(data) * 100) / 100;
    let html = `
<div class="grades-back-btn">&#xd7;</div>
<span class="grades-more-btn">
    <svg width="40" height="40">
        <circle cx="8" cy="20" r="4" />
        <circle cx="20" cy="20" r="4" />
        <circle cx="32" cy="20" r="4" />
    </svg>
</span>
<div class="grades-dropdown-more hidden">
    <span class="grades-link grades-delete-link">${"Semester"} löschen</span>
</div>
<h2 class="grades-heading">${title} (⌀ ${avg})</h2>
<div>
    <div class="grades-overview-container grades-add-grade">
        <span class="grades-overview-span">+ Subject</span>
    </div>
</div>
`;
    for (let i = 0; i < subjGroups.length; i++) {
        let subjGroup = subjGroups[i];
        if (subjGroup.grades.length > 0) {
            let groupAvg = Math.floor(calculateGradesAvg(subjGroup.grades.map(grade => {
                return {
                    "title": "",
                    "grade_type": "subgrade",
                    "weight_type": "fullgrade",
                    "weight": 1,
                    "value": grade
                };
            })) * 100) / 100;
            if (isNaN(groupAvg)) groupAvg = "-";
            html += `
<div class="grades-group-cont grades-sg${i}">
    <div class="grades-group-title">
        <span class="grades-group-name">${subjGroup.title}</span>
        <span class="grades-group-avg has-avg-label">${groupAvg}</span>
    </div>
    ${subjGroup.html}
</div>      
`;
        }
    }
    let divEl = document.createElement("div");
    divEl.classList.add("grades-cont");
    divEl.innerHTML = html;
    return divEl;
}

function getGradeList(data, title, colorname, type) {
    let avg = Math.floor(calculateGradesAvg(data) * 100) / 100;
    let html = `
<div class="grades-back-btn">&#xd7;</div>
<span class="grades-more-btn">
    <svg width="40" height="40">
        <circle cx="8" cy="20" r="3" />
        <circle cx="20" cy="20" r="3" />
        <circle cx="32" cy="20" r="3" />
    </svg>
</span>
<div class="grades-dropdown-more hidden">
    <span class="grades-link grades-delete-link">${(type == "subj") ? "Fach" : "Note"} löschen</span>
</div>
<h2 class="grades-heading">${title} (⌀ ${avg})</h2>
<div class="grades-content">
    <div style="width: 100%;">
        <div class="grades-overview-container grades-add-grade">
            <span class="grades-overview-span">+ Grade</span>
        </div>
        <div class="grades-overview-container grades-add-folder">
            <span class="grades-overview-span">+ Folder</span>
        </div>
    </div>
`;
    for (let i = 0; i < data.length; i++) {
        let grade = data[i];
        html += getGradeContainerHTML(grade, i, colorname);
    }
    html += "</div>";
    let divEl = document.createElement("div");
    divEl.classList.add("grades-cont", "grades-sg" + colorname);
    divEl.innerHTML = html;
    return divEl;
}

function roundedAvg(grade, plusPoints) {
    let rounded = Math.round(grade * 2) / 2;
    if (plusPoints) {
        return (rounded > 4) ? (rounded - 4) : (4 - rounded) * -2;
    }
    return rounded;
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

    console.log(gradesCalc);
    
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