import * as menu from "./gymial.menu.js";

import { $s } from "./gymial.helper.js";

export function init() {
    loadMensa(false);
}

function loadMensa(showProgress) {
    if (showProgress) menu.setProgress(50);
    fetch("/mensa/KZO").then(res => res.json()).then(res => {
        let tableHTML = "";
        for (let date in res) {
            tableHTML += `
            <tr><td style="width: 15%;"><span class="mensa-date">${date}</span></td>
                ${res[date].map(m =>
                `<td>
                    <span class="mensa-desc">
                        <span style="font-weight: bold">${m.title}</span><br>
                        ${m.description}<br>
                    </span>
                </td>`).join("")}
            </tr>`;
        }
        $s("#mensa-table tbody").innerHTML = tableHTML;
        if (showProgress) menu.setProgress(100);
    });
}