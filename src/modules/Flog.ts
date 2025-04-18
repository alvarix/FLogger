/**
 * Interfaces and utility functions for a Flog.
 */

/**
 * The interface for a Flog
 * @public
 */
export interface IFlog extends IFlogCore {
    sourceType: IFlogSourceType,
    url: string,
    permissions?: string,
    readOnly?: boolean,
    rawContent?: string,
    modified?: Date
}

/**
 * The core abstract model for a Flog
 * @private
 */
interface IFlogCore {
    loadedEntries: IEntry[],
    pretext?: string,
    status?: IFlogStatus
}

/**
 * Uses IEntry to define the entries for a flog.
 */
import type { IEntry } from './EntryData'

/**
 * An enum for flog status values
 * @public
 */
export enum IFlogStatus { loaded, error };

/**
 * An enum for flog source types
 * @public
 */
export enum IFlogSourceType { "dropbox", "localFile" };

/**
 * Convert a flog into its string representation.
 * @public
 */
export function serializeFlog(entriesList: IEntry[], pretext?: string): string {
    const sE = serializeEntries(entriesList)
    return (pretext ? pretext + '\n\n' : '') + sE
}

/**
 * Convert an array of IEntries into its string representation
 * @public
 */
export function serializeEntries(entriesList: IEntry[]): string {
    return entriesList.reduce<string>(
        (accumulatedValue, currentEntry, index) => {
            const entryString = `${currentEntry.date.toLocaleDateString("en-US")} ${currentEntry.date.toLocaleTimeString("en-US")}`
                + "\n"
                + `${currentEntry.entry}`
            return accumulatedValue + ((index > 0) ? '\n\n' : '') + entryString
        }
        , '' //start accumulatedValue with an empty string
    )
}

/**
 * Convert an array of IEntries into its string representation
 * @public
 * 
 * @param rawEntryContent: string
 * 
 * @returns IFlogCore
 * 
 * @remarks
 * Expects rawEntryContent string in this format:
 * 
 * @example
 * [Any "pretext" before the first date is optional]
 * 8/22/2024
 * Entry text
 * 
 * 8/22/2024
 * Entry text
 */
export function deserializeFlog(rawEntryContent: string): IFlogCore {
    const legacyDateRegEx = /([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})/
    const newDateTimeRegEx = /([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4} 1?[0-9]:[0-9]{2}:[0-9]{2} [AP]M|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2} 1?[0-9]:[0-9]{2}:[0-9]{2} [AP]M)/
    function isValidDate(dateString) {
        // const date = new Date(dateString);
        // return !isNaN(date.getTime());
        return (new RegExp("^" + legacyDateRegEx.source + "$")).test(
            dateString
        );
    }
    function isValidDateTime(datetimeString) {
        // const date = new Date(dateString);
        // return !isNaN(date.getTime());
        return (new RegExp("^" + newDateTimeRegEx.source + "$")).test(
            datetimeString
        );
    }
    let filteredEntries, pretext, status;
    let splitItems, filteredItems, itemsMappedToEntries;
    try {
        let legacyDateOnly = false
        splitItems = rawEntryContent.split(
            new RegExp("(?:\n\n|^)" + newDateTimeRegEx.source + "\n")
        );
        if (splitItems.length == 0 || (splitItems.length == 1 && !isValidDateTime(splitItems[0]))) {
            // No entries found splitting on date+time format. 
            // Try splitting on legacy date-only format.
            legacyDateOnly = true;
            console.log("No entries found splitting on date+time format. Try splitting on legacy date-only format.", splitItems)
            splitItems = rawEntryContent.split(
                new RegExp("(?:\n\n|^)" + legacyDateRegEx.source + "\n")
            );
        }
        // The following few steps convert array of
        //    [date,entry,date,entry,...]
        // into an array of objects with date and entry properties:
        //    [{date, entry},{date, entry},...]
        filteredItems = splitItems.filter((item) => !!item);
        itemsMappedToEntries = filteredItems.map((item, index, arr) => {
            if (legacyDateOnly && isValidDate(item) && arr[index + 1]) {
                return { date: new Date(arr[index]), entry: arr[index + 1] };
            }
            if (!legacyDateOnly && isValidDateTime(item) && arr[index + 1]) {
                return { date: new Date(arr[index]), entry: arr[index + 1] };
            }
        });
        filteredEntries = itemsMappedToEntries.filter((item) => !!item);

        // "pretext" found before the first date is not returned by this deserializeFlog function (... yet?)
        // But this is how it can be parsed out here, after already splitting by date:
        let firstEntryFound;
        pretext = splitItems.reduce((prev, item, index) => {
            if (legacyDateOnly && !firstEntryFound && isValidDate(item)) {
                firstEntryFound = index;
                return prev;
            }
            if (!legacyDateOnly && !firstEntryFound && isValidDateTime(item)) {
                firstEntryFound = index;
                return prev;
            }
            if (firstEntryFound) {
                return prev;
            } else {
                return (prev || "") + (item || "");
            }
        }, undefined);
        status = IFlogStatus.loaded
    } catch (e) {
        console.log("Error parsing flogger file content", e);
        console.log("rawEntryContent", rawEntryContent);
        status = IFlogStatus.error
        // return [];
    }

    return { loadedEntries: filteredEntries, pretext, status };

}
