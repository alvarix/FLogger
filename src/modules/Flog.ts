import { IEntry } from './EntryData'

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

// Expects entryData string in this format:
// 8/22/2024
// Entry text
// 
// 8/22/2024
// Entry text
// 
export function deserializeEntries(entryData: string): IEntry[] {
    function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    const entriesList: (IEntry | undefined)[] = entryData
        // Split text file at date delimiters,
        // allowing for pretext before first date.
        // The regex matching a date with nothing preceding, 
        // or a date with 2 \n preceding.
        .split(/(?<!.)([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/)
        // Alvar's version to merge in with pretext...
        // .split(/^\n?\n?([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/)
        // Filter out blank array entries (non-date and non-entry),
        // and filter out any pretext in position 0
        .filter((item, index) => item && item != '\n'
            && !(index==0 && !isValidDate(item))
        )
        // Convert array of [date,entry,date,entry,...] into [{date, entry},{date, entry},...]
        .map<IEntry | undefined>((item, index, arr) =>
            index % 2 == 0
                ? { date: new Date(arr[index]), entry: arr[index + 1] }
                : undefined
        )
        // Filter out undefined remnants
        .filter(item => !!item)
    return entriesList as IEntry[]
}

export interface IFlogNewParams extends IFlog { }
