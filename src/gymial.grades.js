import { $c, $i, $sa } from "./gymial.helper.js";

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
    "E52014", // 1
    "E24412", // 1.5
    "E52014", // 2
    "EA582A", // 2.5
    "DD9933", // 3
    "DDCC33", // 3.5
    "CBE436", // 4
    "BFE868", // 4.5
    "A7DD62", // 5
    "3EF746", // 5.5
    "36FF25", // 6
];

const getGradeColor = grade => "#" + ((grade < 1.0) ? getGradeColor(1.0) : (grade > 6.0) ? getGradeColor(6.0) : gradeColors[roundedAvg(grade, false) * 2 - 1]);

let animPlaying = false;

export function init() {
    reloadHTML();
}

function reloadHTML() {
    $i("grades-content").innerHTML = getSemestersHTML(getGradeData());

    for (let e of $sa("#grades-content .grades-sem-container")) {
        const semName = e.dataset.sem;
        e.addEventListener("click", () => {
            if (animPlaying) return;

            $i("grades-semview-cont").innerHTML = getGradeListHTML(getGradeData()[semName], semName);
            
            $c("grades-back-btn").forEach(e => e.addEventListener("click", () => {
                if (animPlaying) return;
                animPlaying = true;
                $i("grades-semview-cont").classList.remove("visible");
                setTimeout(() => {
                    for (let e of $i("grades-content").children) {
                        e.classList.remove("growing");
                    }
                    setTimeout(() => {
                        $i("grades-sems-cont").classList.remove("growing");
                        $i("grades-semview-cont").classList.remove("growing");
                        animPlaying = false;
                    }, 250);
                }, 200);
            }));

            animPlaying = true;
            $i("grades-sems-cont").classList.add("growing");
            e.classList.add("growing");
            setTimeout(() => {
                $i("grades-semview-cont").classList.add("growing");
                $i("grades-semview-cont").classList.add("visible");
                animPlaying = false;
            }, 200);            
    
            for (let e of $c("grades-subj-container")) {
                e.addEventListener("click", el => {
                    if (animPlaying) return;
                    animPlaying = true;
                    $i("grades-sems-cont").classList.add("growing");
                    el.target.classList.add("growing");
                    setTimeout(() => {
                        $i("grades-semview-cont").classList.add("growing");
                        $i("grades-semview-cont").classList.add("visible");
                        animPlaying = false;
                    }, 200);
                });
            }
        });
    }
}

function getGradeContainerHTML(topClass, title, avg, plusPoints) {
    avg = avg.toFixed(2);
    let rounded = roundedAvg(avg, plusPoints);
    if (isNaN(avg)) {
        avg = "-";
        rounded = "-";
    }
    return `
<div class="grades-overview-container ${topClass}" data-sem="${title}">
    <span class="grades-overview-span grades-overview-title">${title}</span>
    <span class="grades-overview-span grades-overview-avg has-avg-label">${avg}</span>
    <span class="grades-overview-span grades-overview-round-avg">${rounded}</span>
    <div class="grades-overview-vertbar" style="background-color: ${getGradeColor(avg)}"></div>
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
        html += getGradeContainerHTML("grades-sem-container", sem, calculateSemAvg(data[sem]), viewPluspoints);
    }
    return html;
}

function getGradeListHTML(data, title) {
    let subjGroups = subjectCategories.map(e => ({"title": e, "grades": [], "html": ""}));
    for (let subj in data) {
        let catName = (subjects[subj]) ? subjects[subj].category : "Andere";
        let categoryID = subjectCategories.indexOf(catName);
        subjGroups[categoryID].grades.push(data[subj]);
        subjGroups[categoryID].html += getGradeContainerHTML("grades-subj-container", subj, calculateGradesAvg(data[subj]), viewPluspoints);
    }
    let html = `
<div class="grades-back-btn">&#xd7;</div>
<span class="grades-more-btn">
    <svg width="40" height="40">
        <circle cx="8" cy="20" r="4" stroke="white" fill="white" />
        <circle cx="20" cy="20" r="4" stroke="white" fill="white" />
        <circle cx="32" cy="20" r="4" stroke="white" fill="white" />
    </svg>
</span>
<h2 class="grades-heading">${title}</h2>
<div>
    <div class="grades-overview-container grades-add-grade">
        <span class="grades-overview-span">+ Grade</span>
    </div>
    <div class="grades-overview-container grades-add-folder">
        <span class="grades-overview-span">+ Folder</span>
    </div>
</div>
`;
    let i = 1;
    for (let subjGroup of subjGroups) {
        if (subjGroup.grades.length > 0) {
            let groupAvg = calculateGradesAvg(subjGroup.grades.map(grade => {
                return {
                    "title": "",
                    "grade_type": "subgrade",
                    "weight_type": "fullgrade",
                    "weight": 1,
                    "value": grade
                };
            })).toFixed(2);
            console.log(subjGroup.grades.map(grade => {
                return {
                    "title": "",
                    "grade_type": "subgrade",
                    "weight_type": "fullgrade",
                    "weight": 1,
                    "value": grade
                };
            }));
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
        i++;
    }
    return html;
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
                let w = isNaN(avg) ? 0 : grade.weight;
                return {
                    "title": grade.title,
                    "grade_type": "regular",
                    "weight_type": grade.weight_type,
                    "weight": w,
                    "value": isNaN(avg) ? 0 : avg
                };
        }
    });

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

    return percEntireGradesAvg * percEntireProp + regGradesAvg * (1 - percEntireProp) + bonusSum;
}