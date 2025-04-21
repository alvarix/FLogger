import { ref, toValue } from "vue"
import type { Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus } from "@/modules/Flog"
import type { IEntry } from '@/modules/EntryData'
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource"

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }

// useFlog returns the refs and operations defined in IFlog 
// It includes:
//  - a refs for the flog
//  - operations for updating the parts of the flog ref (add, udpate, delete entries, and update pretext)

interface IUseFlog {
    flog: Ref<IFlog>;
    addEntry: (entry: IEntry) => void;
    updatePretext: (pretext: string) => void;
    deleteEntry: (entry: IEntry) => void;
    editEntry: (entry: IEntry) => void;
    useKeyDownHandler: (blurCallback: (event: Event) => void) => { handleKeyDown: (event: KeyboardEvent) => void };
}

const { saveFlogToSource } = useFlogSource(IFlogSourceType.dropbox);

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

export const useFlog = (inFlog: IFlog | Ref<IFlog>): IUseFlog => {

    // Use toValue here to make sure we're not chaining a ref
    // We want the flog ref in this composable to be independent of the input
    const flog = ref<IFlog>(toValue(inFlog))

    const addEntry = (entry: IEntry) => {
        flog.value.loadedEntries.unshift(entry)
    }

    const updatePretext = (pretext: string) => {
        flog.value.pretext = pretext
    }


    const showMessage = (msg: string) => {
        const el = document.querySelector('.message') as HTMLDivElement;
        el.textContent = msg;
        el.style.opacity = '1';
        setTimeout(() => {
            el.style.opacity = '0';
        }, 3000);
    };

    const deleteEntry = (entry: IEntry) => {
        if (!flog || !Array.isArray(flog.value.loadedEntries)) {
            console.error('Flog or flog.value.loadedEntries is undefined or not an array');
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
            console.error('Entry not found in flog.value.loadedEntries');
        }
    };

    const editEntry = (entry: IEntry) => {
        if (!flog || !Array.isArray(flog.value.loadedEntries)) {
            console.error(`Flog or flog.value.loadedEntries is undefined or not an array: ${flog}`);
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
            console.error('Entry not found in flog.value.loadedEntries');
        }
    }

    return {
        flog,
        addEntry,
        updatePretext,
        deleteEntry,
        editEntry,
        useKeyDownHandler
    }
}
