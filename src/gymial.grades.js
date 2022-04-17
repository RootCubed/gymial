import { $c, $i } from "./gymial.helper.js";

const subjects = {
    "AC": "Anwendungen des Computers",
    "AM": "Anwendungen der Mathematik",
    "B": "Biologie",
    "BG": "Bildnerisches Gestalten",
    "C": "Chemie",
    "D": "Deutsch",
    "DB": "Deutsch Beratungsstunde",
    "E": "Englisch",
    "EW": "Einführung Wirtschaft",
    "EWR": "Einführung Wirtschaft und Recht",
    "F": "Französisch",
    "FB": "Französisch Beratungsstunde",
    "FF": "Freifach",
    "FIN": "Finanzen",
    "GG": "Geographie",
    "GR": "Griechisch",
    "INS": "Instrumentalunterricht",
    "IT": "Italienisch",
    "K": "Klassenstunde",
    "L": "Latein",
    "M": "Mathematik",
    "M+A": "Mensch und Arbeit",
    "MU": "Musik",
    "P": "Physik",
    "R": "Recht",
    "RL": "Religion",
    "RW": "Rechnungswesen",
    "SP": "Spanisch",
    "T": "Turnen",
    "TF": "Turnen Frauen",
    "TM": "Turnen Männer",
    "VWL": "Volkswirtschaftslehre",
};

let animPlaying = false;

export function init() {
    for (let e of $i("grades-content").children) {
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
}
