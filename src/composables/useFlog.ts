import { ref, toValue, watch } from "vue"
import type { Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus } from "@/modules/Flog"
import EntryData, { type IEntry } from '@/modules/EntryData'
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource"
import { useTags, type Tag, type TagEntryDate, type TagMap } from "@composables/useTags"

// Re-export these for convenience
export type { Tag as Tag }
export type { IEntry as IEntry }
export { EntryData as EntryData }
export { IFlogSourceType as IFlogSourceType }

/**
 * The Dropbox flog source operation used by useFlog
 */
const { saveFlogToSource } = useFlogSource(IFlogSourceType.dropbox);

/**
 * The shared TagIndex and methods
 */
const { getTagsForFlog, getTagsForFlogEntryDate, tagIndex } = useTags();

/**
 * Represents the refs and functions returned by the useFlog composable
 */
interface IUseFlog {
    /**
     * The flog ref
     */
    flog: Ref<IFlog>;
    /**
     * The shared tagIndex.tagMap filtered for this flog
     */
    flogTagMap?: Ref<TagMap>;
    /**
     * Updates the flog's pretext and saves the flog to source
     * @param {IEntry} entry 
     * @returns 
     */
    updatePretext: (pretext: string) => void;
    /**
     * Adds the input entry to the flog's array of entries.
     * Currently doesn't save to source, but probably should for symmetry with the other 
     * functions in useFlog.
     * @param {IEntry} entry 
     * @returns 
     */
    addEntry: (entry: IEntry) => void;
    /**
     * Updates the input entry and saves the flog to source
     * @param {IEntry} entry 
     * @returns 
     */
    editEntry: (entry: IEntry) => void;
    /**
     * Deletes the input entry and saves the flog to source
     * @param {IEntry} entry 
     * @returns 
     */
    deleteEntry: (entry: IEntry) => void;
    /**
     * Returns a list of Tags for a given EntryDate for the current flog.
     * Makes use of useTags.getTagsForFlogEntryDate
     * @param {IEntry} entry 
     * @returns 
     */
    getTagsForEntryDate: (entryDate: TagEntryDate) => Tag['tag'][]
}

/**
 * A composable function that manages a single flog.
 *
 * @returns {IUseFlog} An object with a flog ref and functions to add/edit/delete 
 * entries, update pretext.
 */
export const useFlog = (inFlog: IFlog | Ref<IFlog>): IUseFlog => {

    /**
     * Shows the input message in a UI element with class 'message'
     * @private
     * @param msg 
     */
    const showMessage = (msg: string) => {
        const el = document.querySelector('.message') as HTMLDivElement;
        el.textContent = msg;
        el.style.opacity = '1';
        setTimeout(() => {
            el.style.opacity = '0';
        }, 3000);
    };

    // Use toValue here to make sure we're not chaining a ref
    // We want the flog ref in this composable to be independent of the input
    const flog = ref<IFlog>(toValue(inFlog))

    const flogTagMap = ref<TagMap>(getTagsForFlog(flog.value.url))
    watch(
        tagIndex,
        () => {
            flogTagMap.value = getTagsForFlog(flog.value.url)
        },
        { immediate: true }
    );

    const updatePretext = (pretext: string) => {
        flog.value.pretext = pretext
    }

    const addEntry = (entry: IEntry) => {
        flog.value.loadedEntries.unshift(entry)
    }

    const editEntry = (entry: IEntry) => {
        if (!flog.value || !Array.isArray(flog.value.loadedEntries)) {
            console.error(`EditFlog or flog.value.loadedEntries is undefined or not an array: ${flog.value}`);
            return;
        }
        // Find the index of the entry to delete
        const editEntryIndex = flog.value.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (editEntryIndex !== -1) {
            // Update the entry at the found index
            flog.value.loadedEntries[editEntryIndex] = { ...flog.value.loadedEntries[editEntryIndex], ...entry };
            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog.value);
            showMessage('Saved');

        } else {
            console.error('Entry not found in flog.value.loadedEntries', editEntryIndex , "\n", entry.id);
        }
    }

    const deleteEntry = (entry: IEntry) => {
        if (!flog.value || !Array.isArray(flog.value.loadedEntries)) {
            console.error('EditFlog.value or flog.value.loadedEntries is undefined or not an array');
            return;
        }
        // Find the index of the entry to delete
        const deleteEntryIndex = flog.value.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (deleteEntryIndex !== -1) {
            // Remove the entry
            flog.value.loadedEntries.splice(deleteEntryIndex, 1);

            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog.value);
        } else {
            console.error('Entry not found in flog.value.loadedEntries\n');
        }
    };

    const getTagsForEntryDate = (entryDate: TagEntryDate): Tag['tag'][] => {
        return getTagsForFlogEntryDate(flog.value.url, entryDate)
    }

    return {
        flog,
        flogTagMap,
        updatePretext,
        addEntry,
        editEntry,
        deleteEntry,
        getTagsForEntryDate,
    }
}

/**
 * A secondary utility composable to create a keydown handler that executes the input blurCallback if keydown is shift+Enter.
 *
 * @param {Function} blurCallback - A blur event handler to call if keydown is shift+Enter
 * 
 * @returns {Function} A keydown handler that calls the blurCallback if keydown is shift+Enter.
 */
export function useKeyDownHandler(blurCallback: (event: Event) => void) {
    function handleKeyDown(event: KeyboardEvent) {
        if (event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            blurCallback(event);
            (event.target as HTMLElement)?.blur();
        }
    }
    return { handleKeyDown };
}

/**
 * Re-export these for convenience
 */
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }
