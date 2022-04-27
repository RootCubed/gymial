export function $s (selector) {
    return document.querySelector(selector);
}

export function $sa (selector) {
    return Array(...document.querySelectorAll(selector));
}

export function $i(id) {
    return document.getElementById(id);
}

export function $c(className) {
    return Array(...document.getElementsByClassName(className));
}