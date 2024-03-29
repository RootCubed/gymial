import { $i, $c } from "./gymial.helper.js";

import * as gymial from "./gymial.module.js";

let avStyles;

// for previewer
const cancelledLessons = [["AM", "04 Hu"], ["P", "51 Cp"], ["SP", "35 Mo"], ["M", "14 Hu"], ["G", "1C Gn"], ["L", "1G Sc"], ["AM", "18 Ke"], ["GG", "67 Hf"], ["C", "C2 Vz"]];
const nonCancelledLessons = [["E", "1C Cj"], ["M", "68 Mz"], ["MU", "64 Sn"], ["INS", "I1 Rt"], ["B", "B3 Ha"], ["L", "24 Sk"], ["EWR", "52 Bd"], ["M", "28 Dr"], ["G", "32 Wr"]];

export function init() {
    fetch("/styles/").then(res => res.json()).then(r => {
        avStyles = r;
        initStyles();
    });
}

function initStyles() {
    $i("stylepicker").innerHTML = "";
    let svgContent;
    try {
        svgContent = new XMLSerializer().serializeToString($i("styleprevsvg").getSVGDocument());
    } catch (e) {
        console.info("style preview svg not loaded yet");
        // The SVG is not ready yet, wait until it is loaded
        $i("styleprevsvg").addEventListener("load", () => {
            initStyles();
        });
        return;
    }
    for (let style in avStyles) {
        let randomCancelled = Math.floor(Math.random() * cancelledLessons.length);
        let randomNonCancelled = Math.floor(Math.random() * nonCancelledLessons.length);
        $i("stylepicker").innerHTML += `
        <div class="stylepreview_cont">
            <span class="style_name">${style}</span>
            ${svgContent
                .replace("$LES1S$", cancelledLessons[randomCancelled][0]).replace("$LES1T$", cancelledLessons[randomCancelled][1])
                .replace("$LES2S$", nonCancelledLessons[randomNonCancelled][0]).replace("$LES2T$", nonCancelledLessons[randomNonCancelled][1])
            }
        </div>`;
    }

    // temporary "in progress" message
    $i("stylepicker").innerHTML += `<div style="display: inline-block;"><span class="style_name">Weitere in Entwicklung...</span><div style="display: inline-block; height: 12.5vh;"></div></div>`;
    
    let previewers = [];
    for (let i = 0; i < Object.keys(avStyles).length; i++) {
        let el = $c("stylepreview_cont")[i];
        previewers.push(el);
        let style = Object.keys(avStyles)[i];
        for (let prop in avStyles[style]) {
            el.style.setProperty("--sp_" + prop, avStyles[style][prop]);
        }
        if (style == gymial.store.getStyleName()) {
            el.classList.add("selected");
        }
        el.addEventListener("click", () => {
            for (let pv of previewers) {
                pv.classList.remove("selected");
            }
            let currentStyle = {
                name: style,
                data: avStyles[style]
            };
            el.classList.add("selected");
            applyStyle(currentStyle);
            gtag("event", "applyNewStyle");
        });
    }
}

export function applyStyle(style) {
    gymial.store.setStyle(style);
    for (let prop in style.data) {
        document.documentElement.style.setProperty("--" + prop, style.data[prop]);
    }
}