export function getScrollbarWidth() {
    return window.innerWidth - document.body.clientWidth;
}

export function checkForScrollbar(element) {
    return element.scrollHeight > element.clientHeight;
}
