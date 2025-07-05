/**
 * Places the cursor at the end of the specified HTML element
 * @param element - The HTML element to place the cursor in
 */
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

/**
 * Extracts heading text from markdown string by matching lines that start with "# "
 * @param markdownString - The markdown text to parse
 * @returns Array of heading strings found in the markdown
 */
export function parseHeadingsFromMarkdownString(markdownString: string): string[] {
    const headings: string[] = markdownString.match(/(?<=^# ).*$/gm) ?? [];
    return headings;
}

/**
 * Converts a string to a valid ID by replacing invalid characters with underscores
 * @param inputString - The string to convert to an ID
 * @returns A string suitable for use as an HTML ID attribute
 */
export function getIdString(inputString: string): string {
    return inputString.replace(/^[^a-z]+|[^\w:.-]+/gi, "_");
}

/**
 * Builds a regular expression from an array of strings, escaping special regex characters
 * @param strings - Array of strings to include in the regex pattern
 * @param flags - Optional regex flags (default: empty string)
 * @returns A RegExp object that matches any of the provided strings
 */
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

/**
 * Renders text with specified tags wrapped in button elements for styling
 * @param text - The text to process
 * @param tags - Array of tag strings to highlight in the text
 * @returns HTML string with tags wrapped in button elements
 */
export function renderTextWithTagsMarkedup(text: string, tags: string[]): string {
    return text.replace(
        buildRegexFromArray(tags, "g"),
        (match) => `<button class="md-tag">${match}</button>`
    )
}