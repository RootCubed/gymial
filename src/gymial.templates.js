import sgIcon from "./icon-subgrade.svg";
import addSgIcon from "./icon-add-subgrade.svg";
import addGradeIcon from "./icon-add-grade.svg";

const gradeContainerGeneric = (className, title, vertbarCol, content, index) => `
<div class="grades-overview-container ${className}" data-name="${title}"
${(index != undefined) ? "data-index=\"" + index + "\"" : ""}>
    <span class="grades-overview-span grades-overview-title">${title}</span>
    <h3 style="margin-bottom: 15px;color: #ff4141;display:none;">Summe der Notenanteile über 100%!</h3>
    ${content}
    <div class="grades-overview-vertbar" style="background-color: ${vertbarCol}"></div>
</div>
`;

export const gradeSemContainer = (className, title, plusPoints, avg, vertbarCol) => {
    return gradeContainerGeneric(className, title, vertbarCol, `
        <span class="grades-overview-span grades-overview-avg">
            <span class="grades-small-pluspoint-cont">${plusPoints}</span>
        </span>
        <span class="grades-overview-span grades-overview-round-avg">${avg}</span>
    `);
};

export const gradeSubjContainer = (className, title, trueAvg, roundedAvg, vertbarCol) => {
    return gradeContainerGeneric(className, title, vertbarCol, `
        <span class="grades-overview-span grades-overview-avg has-avg-label">${trueAvg}</span>
        <span class="grades-overview-span grades-overview-round-avg">${roundedAvg}</span>
    `);
};

export const gradeGradeContainer = (className, index, title, weight, roundedAvg, vertbarCol) => {
    return gradeContainerGeneric(className, title, vertbarCol, `
        <span class="grades-overview-sg-icon color-svg" style="${className.includes("subgrade") ? "" : "display: none;"}">
            ${sgIcon}
        </span>
        <span class="grades-overview-span grades-overview-weight">${weight}</span>
        <span class="grades-overview-span grades-overview-grade">${roundedAvg}</span>
    `, index);
};

const gradeListPre = (links, title, avg) => `
<div class="grades-view-header">
<div class="grades-back-btn color-svg">
    <svg width="40" height="40">
        <line x1="12" y1="12" x2="28" y2="28" />
        <line x1="28" y1="12" x2="12" y2="28" />
    </svg>
</div>
<span class="grades-more-btn color-svg-fill">
    <svg width="40" height="40">
        <circle cx="8" cy="20" r="3" />
        <circle cx="20" cy="20" r="3" />
        <circle cx="32" cy="20" r="3" />
    </svg>
</span>
<h2 class="grades-heading">${title} (⌀ ${avg})</h2>
<div class="grades-dropdown-more hidden">
    ${links.map(e => {
        return `<span class="grades-link ${e.cl}">${e.title}</span>`;
    }).join("")}
</div>
</div>
`;

const gradeListAddForm = (placeholder) => `
    <div class="grades-sem-add-form">
        <input type="text" placeholder="${placeholder}">
        <div class="grades-confirm-add-cont">
            <span class="grades-confirm-add">+</span>
        </div>
    </div>  
`;

const gradeListAddForSem = `
<div class="grades-overview-container grades-add grades-add-sem">
    <span class="grades-overview-span">Semester erstellen</span>
    ${gradeListAddForm("Semester benennen")}
</div>
`;

const gradeListAddForSubj = `
<div class="grades-overview-container grades-add grades-add-subj">
    <span class="grades-overview-span">Fach hinzufügen</span>
    ${gradeListAddForm("Fach")}
</div>
`;

const gradeListAddForGrade = `
<div class="grades-overview-container grades-add grades-add-grade small">
    <span class="grades-overview-span"><span class="color-svg">${addGradeIcon}</span></span>
</div>
<div class="grades-overview-container grades-add grades-add-subgrade small">
    <span class="grades-overview-span"><span class="color-svg">${addSgIcon}</span></span>
</div>
`;

export const gradeListSem = (content) => `
${gradeListAddForSem}
${content}
`;

export const gradeList = (links, title, avg, type, content) => `
${gradeListPre(links, title, avg)}
${(type == "sem") ? "" : "<div class=\"grades-content\">"}
    <div style="width: 100%;">
        ${(type == "sem") ? gradeListAddForSubj : gradeListAddForGrade}
    </div>
    ${content}
${(type == "sem") ? "" : "</div>"}
`;

export const gradeGroup = (title, avg, content) => `
<div class="grades-group-cont">
    <div class="grades-group-title">
        <span class="grades-group-name">${title}</span>
        <span class="grades-group-avg has-avg-label">${avg}</span>
    </div>
    ${content}
</div> 
`;

export const weightSpan = (pre, frac, post) => `
<span class="grades-overview-weight-w">${pre}</span>
<div class="frac">
${
    (frac == null) ? "" :
    `<span class="f1">${frac.numer}</span>
    <span class="f2">${frac.denom}</span>`
}
</div>
<span class="grades-overview-weight-t">${post}</span>
`;