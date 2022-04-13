import * as gymial from "./gymial.module.js";

import { $s } from "./gymial.helper.js";

export function init() {
    loadMensa("KZO", false);
}

export function loadMensa(name, showProgress) {
    if (showProgress) gymial.menu.setProgress(50);
    fetch("/mensa/" + name).then(res => res.json()).then(res => {
        let tableHTML = "";
        for (let date in res) {
            tableHTML += `<tr><td style="width: 15%;"><span class="mensa-date">${date}</span></td>`;
            for (let menu of res[date]) {
                tableHTML += `<td>
                    <span class="mensa-desc">
                        <span style="font-weight: bold">${menu.title}</span><br>
                        ${menu.description}<br>
                    </span>
                </td>`;
            }
            tableHTML += "</tr>";
        }
        $s("#mensa-table tbody").innerHTML = tableHTML;
        if (showProgress) gymial.menu.setProgress(100);
    });
}