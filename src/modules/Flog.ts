import { IEntry } from './EntryData'

export interface IFlog {
    url: string,
    permissions?: string,
    loadedEntries: IEntry[],
}

export function serializeEntries(entriesList: IEntry[]): string {
    return entriesList.reduce<string>(
        (accumulatedValue, currentEntry, index) => {
            return accumulatedValue + `\n\n${currentEntry.date.toDateString()}\n${currentEntry.entry}`
        }
        , '' //start accumulatedValue with an empty string
    )
}
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
