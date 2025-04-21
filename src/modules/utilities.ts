export function placeCursorAtEnd(element: HTMLElement) {
    if (element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false); // Collapse to the end
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}

