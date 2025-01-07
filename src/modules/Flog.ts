import type { IEntry } from './EntryData'

export interface IFlog {
    sourceType: "dropbox" | "local file",
    url: string,
    permissions?: string,
    loadedEntries: IEntry[],
    readOnly?: boolean,
}

export function serializeEntries(entriesList: IEntry[]): string {
    return entriesList.reduce<string>(
        (accumulatedValue, currentEntry, index) => {
            const entryString = `${currentEntry.date.toLocaleDateString()}`
                + "\n"
                + `${currentEntry.entry}`
            return accumulatedValue + ((index > 0) ? '\n\n' : '') + entryString
        }
        , '' //start accumulatedValue with an empty string
    )
}

// Expects rawEntryContent string in this format:
// 
// [Any "pretext" before the first date is optional]
// 8/22/2024
// Entry text
// 
// 8/22/2024
// Entry text
// 
export function deserializeEntries(rawEntryContent: string): IEntry[] {
    function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    let filteredEntries, pretext;
    try {
        let splitItems, filteredItems, itemsMappedToEntries, firstEntryIndex;
        splitItems = rawEntryContent.split(
            /(?<!.)([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/
        );
        filteredItems = splitItems.filter(item => !!item)

        itemsMappedToEntries = filteredItems.map((item, index, arr) => {
            if (isValidDate(item) && arr[index + 1]) {
                firstEntryIndex = firstEntryIndex || index;
                return { date: new Date(arr[index]), entry: arr[index + 1] };
            }
        });
        filteredEntries = itemsMappedToEntries.filter((item) => !!item);

        // pretext is not returned by this deserializeEntries function (... yet?)
        // But this is how it can be parsed out here after splitting by date:
        pretext = splitItems.reduce((prev, current, index) => {
            if (index < firstEntryIndex) {
                return (prev || "") + (current || "") + "\n";
            } else {
                return prev;
            }
        }, "");
        console.log("pretext", pretext);

    } catch (e) {
        console.log("Error parsing flogger file content", e);
        console.log("rawEntryContent", rawEntryContent);
        return []
    }

    return filteredEntries as IEntry[];

}

export interface IFlogNewParams extends IFlog { }
