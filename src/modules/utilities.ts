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

export function parseHeadingsFromMarkdownString(markdownString: string): string[] {
    const headings: string[] = markdownString.match(/(?<=^# ).*$/gm) ?? [];
    return headings;
}

export function getIdString(inputString: string): string {
    return inputString.replace(/^[^a-z]+|[^\w:.-]+/gi, "_");
}

export function buildRegexFromArray(strings: string[], flags: string = ""): RegExp {
    const escapedStrings = strings.map((s) =>
        // eslint-disable-next-line
        s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
    );
    const regexPattern = strings.length == 0
        ? "(?!.*)"
        : "(" + escapedStrings.join("|") + ")";
    return new RegExp(regexPattern, flags);
}

export function renderTextWithTagsMarkedup(text: string, tags: string[]): string {
    return text.replace(
        buildRegexFromArray(tags, "g"),
        (match) => `<button class="md-tag">${match}</button>`
    )
}