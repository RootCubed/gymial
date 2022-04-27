import { $c, $i } from "./gymial.helper.js";

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

let animPlaying = false;

export function init() {
    reloadHTML();
}

function reloadHTML() {
    $i("grades-content").innerHTML = getSemestersHTML(getGradeData());

    for (let e of $i("grades-content").children) {
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

function getSemestersHTML(data) {
    let html = "";
    for (let sem in data) {
        let avg = calculateSemAvg(data[sem]);
        html += `
<div class="grades-overview-container grades-sem-container" data-sem="${sem}">
    <span class="grades-overview-span grades-overview-title">${sem}</span>
    <span class="grades-overview-span grades-overview-avg has-avg-label">${avg}</span>
    <span class="grades-overview-span grades-overview-round-avg">${roundedAvg(avg, viewPluspoints)}</span>
    <div class="grades-overview-vertbar"></div>
</div>
`;
    }
    return html;
}

function getGradeListHTML(data, title) {
    let subjGroups = subjectCategories.map(e => ({"title": e, "grades": [], "html": ""}));
    for (let subj in data) {
        let catName = (subjects[subj]) ? subjects[subj].category : "Andere";
        let categoryID = subjectCategories.indexOf(catName);
        subjGroups[categoryID].grades.push(data[subj]);
        let avg = calculateGradesAvg(data[subj]);
        subjGroups[categoryID].html += `
<div class="grades-overview-container grades-subj-container">
    <span class="grades-overview-span grades-overview-title">${subj}</span>
    <span class="grades-overview-span grades-overview-avg has-avg-label">${avg}</span>
    <span class="grades-overview-span grades-overview-round-avg">${roundedAvg(avg, viewPluspoints)}</span>
    <div class="grades-overview-vertbar"></div>
</div>
`;
    }
    let html = `
<div class="grades-back-btn">&#xd7;</div>
<h2 class="grades-heading">${title}</h2>
`;
    let i = 1;
    for (let subjGroup of subjGroups) {
        if (subjGroup.grades.length > 0) {
            html += `
<div class="grades-group-cont grades-sg${i}">
    <div class="grades-group-title">
        <span class="grades-group-name">${subjGroup.title}</span>
        <span class="grades-group-avg has-avg-label">${calculateGradesAvg(subjGroup.grades)}</span>
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
    // TODO: implement
    return calculateGradesAvg();
}

function calculateGradesAvg(data) {
    // TODO: implement
    return Math.floor((Math.random() * 5 + 1) * 100) / 100;
}