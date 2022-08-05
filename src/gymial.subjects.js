export const categories = [
    "Sprachen",
    "Naturwissenschaften",
    "Geisteswissenschaften",
    "Wirtschaftsfächer",
    "Andere"
];

const GF = "Grundlagenfach";
const SPF = "Schwerpunktfach";
const WF = "Wahlfach";
const WK = "Wahlkurs";
const EF = "Ergänzungsfach";
const FF = "Freifach";

export const subjects = [
    {
        name: "Anwendungen des Computers",
        shortName: "AC",
        types: [GF],
        category: "Andere"
    },
    {
        name: "Anwendungen der Mathematik",
        shortName: "AM",
        types: [SPF, EF],
        category: "Naturwissenschaften"
    },
    {
        name: "Biologie",
        shortName: "B",
        types: [GF, SPF, WF, EF],
        category: "Naturwissenschaften"
    },
    {
        name: "Bildnerisches Gestalten",
        shortName: "BG",
        types: [GF, SPF, EF],
        category: "Andere"
    },
    {
        name: "Chemie",
        shortName: "C",
        types: [GF, SPF, WF, EF],
        category: "Naturwissenschaften"
    },
    {
        name: "Deutsch",
        shortName: "D",
        types: [GF, WK],
        category: "Sprachen"
    },
    {
        name: "Englisch",
        shortName: "E",
        types: [GF, WK],
        category: "Sprachen"
    },
    {
        name: "Einführung Wirtschaft",
        shortName: "EW",
        types: [SPF],
        category: "Wirtschaftsfächer"
    },
    {
        name: "Einführung Wirtschaft und Recht",
        shortName: "EWR",
        types: [GF],
        category: "Wirtschaftsfächer"
    },
    {
        name: "Französisch",
        shortName: "F",
        types: [GF, WK],
        category: "Sprachen" 
    },
    {
        name: "Freifach",
        shortName: "FF",
        category: "Andere"
    },
    {
        name: "Finanzen",
        shortName: "FIN",
        types: [SPF],
        category: "Wirtschaftsfächer"
    },
    {
        name: "Geographie",
        shortName: "GG",
        types: [GF, WF, EF],
        category: "Geisteswissenschaften"
    },
    {
        name: "Geschichte",
        shortName: "G",
        types: [GF, WF, EF],
        category: "Geisteswissenschaften"
    },
    {
        name: "Griechisch",
        shortName: "GR",
        types: [SPF],
        category: "Sprachen" 
    },
    {
        name: "Italienisch",
        shortName: "IT",
        types: [SPF, WK],
        category: "Sprachen" 
    },
    {
        name: "Informatik",
        shortName: "IN",
        types: [EF],
        category: "Andere"
    },
    {
        name: "Latein",
        shortName: "L",
        types: [GF, SPF],
        category: "Sprachen"  
    },
    {
        name: "Mathematik",
        shortName: "M",
        types: [GF, WF, WK, EF],
        category: "Naturwissenschaften"  
    },
    {
        name: "Mensch und Arbeit",
        shortName: "M+A",
        types: [SPF],
        category: "Wirtschaftsfächer"
    },
    {
        name: "Musik",
        shortName: "MU",
        types: [GF, SPF, EF],
        category: "Andere" 
    },
    {
        name: "Philosophie",
        shortName: "PH",
        types: [EF],
        category: "Geisteswissenschaften"
    },
    {
        name: "Physik",
        shortName: "P",
        types: [GF, SPF, WF, EF],
        category: "Naturwissenschaften"  
    },
    {
        name: "Recht",
        shortName: "R",
        types: [SPF],
        category: "Wirtschaftsfächer"  
    },
    {
        name: "Religion",
        shortName: "RL",
        types: [FF, EF],
        category: "Geisteswissenschaften" 
    },
    {
        name: "Rechnungswesen",
        shortName: "RW",
        types: [SPF],
        category: "Wirtschaftsfächer" 
    },
    {
        name: "Spanisch",
        shortName: "SP",
        types: [SPF, WK],
        category: "Sprachen"
    },
    {
        name: "Sport",
        altNames: ["Turnen"],
        shortName: "T",
        types: [GF, EF],
        category: "Andere"  
    },
    {
        name: "Volkswirtschaftslehre",
        shortName: "VWL",
        types: [SPF],
        category: "Wirtschaftsfächer"
    },
    {
        name: "Wirtschaft und Recht",
        shortName: "W+R",
        types: [EF],
        category: "Wirtschaftsfächer"
    }
];