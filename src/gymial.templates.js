const gradeContainerGeneric = (className, title, vertbarCol, content, index) => `
<div class="grades-overview-container ${className}" data-name="${title}"
${(index != undefined) ? "data-index=\"" + index + "\"" : ""}>
    <span class="grades-overview-span grades-overview-title">${title}</span>
    ${content}
    <div class="grades-overview-vertbar" style="background-color: ${vertbarCol}"></div>
</div>
`;

export const gradeSubjContainer = (className, title, trueAvg, roundedAvg, vertbarCol) => {
    return gradeContainerGeneric(className, title, vertbarCol, `
        <span class="grades-overview-span grades-overview-avg has-avg-label">${trueAvg}</span>
        <span class="grades-overview-span grades-overview-round-avg">${roundedAvg}</span>
    `);
};

export const gradeGradeContainer = (className, index, title, weight, roundedAvg, vertbarCol) => {
    return gradeContainerGeneric(className, title, vertbarCol, `
        <span class="grades-overview-span grades-overview-weight">${weight}</span>
        <span class="grades-overview-span grades-overview-grade">${roundedAvg}</span>
    `, index);
};

const gradeListPre = (links, title, avg) => `
<div class="grades-back-btn">&#xd7;</div>
<span class="grades-more-btn">
    <svg width="40" height="40">
        <circle cx="8" cy="20" r="3" />
        <circle cx="20" cy="20" r="3" />
        <circle cx="32" cy="20" r="3" />
    </svg>
</span>
<div class="grades-dropdown-more hidden">
    ${links.map(e => {
        return `<span class="grades-link ${e.cl}">${e.title}</span>`;
    }).join("")}
</div>
<h2 class="grades-heading">${title} (⌀ ${avg})</h2>
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
<div class="grades-overview-container grades-add-sem">
    <span class="grades-overview-span">(Placeholder) +Semester</span>
    ${gradeListAddForm("HS22")}
</div>
`;

const gradeListAddForSubj = `
<div class="grades-overview-container grades-add-subj">
    <span class="grades-overview-span">(Placeholder) +Subject</span>
    ${gradeListAddForm("Mathe")}
</div>
`;

const gradeListAddForGrade = `
<div class="grades-overview-container grades-add-grade small">
    <span class="grades-overview-span">(Placeholder) +Grade</span>
</div>
<div class="grades-overview-container grades-add-folder small">
    <span class="grades-overview-span">(Placeholder) +Folder</span>
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