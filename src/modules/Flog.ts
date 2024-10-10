import { IEntry } from './EntryData'

export interface IFlog {
    url: string,
    permissions?: string,
    loadedEntries: IEntry[],
}

export function serializeEntries(entriesList: IEntry[]): string {
    console.log('entriesList', entriesList)
    return entriesList.reduce<string>(
        (accumulatedValue, currentEntry, index) => {
            console.log(currentEntry)
            const entryString = `${currentEntry.date.toLocaleDateString()}`
                + "\n"
                + `${currentEntry.entry}`
            console.log(currentEntry, entryString)
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
    const entriesList: (IEntry | undefined)[] = entryData
        // split text file at date delimiters
        .split(/^\n?\n?([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4})\n/)
        // filter out blank array entries (non-date and non-entry)
        .filter(item => item && item != '\n')
        // convert array of [date,entry,date,entry,...] into [{date, entry},{date, entry},...]
        .map<IEntry | undefined>((item, index, arr) => index % 2 == 0 ? { date: new Date(arr[index]), entry: arr[index + 1] } : undefined)
        // filter out undefined remnants
        .filter(item => !!item)
    return entriesList as IEntry[]
}

export interface IFlogNewParams extends IFlog { }
