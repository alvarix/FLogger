import { ref, watch, Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus, IFlogSourceType } from "@/modules/Flog"
import { IEntry } from '@/modules/EntryData'
import { useDropboxFlogs, IDropboxFlog } from "@/composables/useDropboxFlogs";

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }
export { IFlogSourceType as IFlogSourceType }

export interface IFlogs {

    // ***************
    // AVAILABLE FLOGS
    // ***************

    // useFlogs provides and manages one array for all available non-repo flogs 
    // from all sources.
    availableFlogs: Ref<IFlog[]>;
    // useFlogs provides and manages one array for all available repo flogs 
    // from all sources.
    availableRepoFlogs: Ref<IFlog[]>;

    // useFlogs provides the following flog operations
    //      add, delete
    // These map the operation to correct operation 
    // for the flog's source
    // 
    // The following are functions that take a flog
    // and call the appropriate pass through function
    // from use[flog.sourceType]Flogs
    addFlogToSource: (flog: IFlog) => void;
    deleteFlogFromSource: (flog: IFlog) => void;

    // ***************
    // OPEN FLOGS
    // ***************

    // useFlogs provides and manages one array for all open flogs 
    // from all sources.
    openFlogs: Ref<IFlog[]>;

    // useFlogs provides the following flog operations
    //      add, delete
    // These map the operation to correct operation 
    // for the flog's source
    // 
    // The following are functions that take a flog
    // and call the appropriate pass through function
    // from use[flog.sourceType]Flogs
    openFlog: (flog: IFlog) => void;
    loadFlogEntriesFromSource: (flog: IFlog) => void;
    saveFlogToSource: (flog: IFlog) => void;
    closeFlog: (flog: IFlog) => void;

    // *************
    // FLOG CONTENTS
    // *************

    updatePretext: (pretext: string, flog: IFlog) => void;
    addEntryToFlog: (entry: IEntry, flog: IFlog) => void;
    editEntryFromFlog: (flog: IFlog, entry: IEntry) => void;
    deleteEntryFromFlog: (flog: IFlog, entry: IEntry) => void;

    // **************
    // SOURCE ACCOUNT
    // **************

    // useFlogs provides a Map of accountOwners per source.
    // Each value contains the pass through ref values from its 
    // corresponding source.
    accountOwner: Ref<Map<IFlogSourceType, string | null>>;

    // *****************
    // SOURCE OPERATIONS
    // *****************

    // useFlogs provides the following source operations
    //      launchConnectFlow, openPopup, clearConnection
    // These map the operation to correct operation 
    // for the input SourceType.
    // The naming of these could be improved, or generalized 
    // to make sense for multiple sources. 
    launchConnectFlow: (sourceType: IFlogSourceType) => void;
    openPopup: (sourceType: IFlogSourceType) => void;
    clearConnection: (sourceType: IFlogSourceType) => void;

    // useFlogs provides a Map of hasConnection booleans per source.
    // Each value contains the pass through ref values from its 
    // corresponding source.
    hasConnection: Ref<Map<IFlogSourceType, boolean>>;

    // useFlogs provides a Map of connectionPopupWindows per source.
    // Each value contains the pass through ref values from its 
    // corresponding source.
    // 
    // The value of each connectionPopupWindow ref is the popup window object 
    // for that source, when there is one open.
    // Trying to access the window object properties while that window is 
    // at a dropbox URL will throw CORS errors.
    connectionPopupWindow: Ref<Map<IFlogSourceType, any>>;
}

const {
    availableFlogs: availableFlogs_dropbox,
    availableRepoFlogs: availableRepoFlogs_dropbox,
    addFlog: addFlog_dropbox,
    deleteFlog: deleteFlog_dropbox,
    loadFlogEntries: loadFlogEntries_dropbox,
    saveFlogEntries: saveFlogEntries_dropbox,
    accountOwner: accountOwner_dropbox,
    launchConnectFlow: launchConnectFlow_dropbox,
    openDbxPopup: openDbxPopup_dropbox,
    clearConnection: clearConnection_dropbox,
    hasConnection: hasConnection_dropbox,
    connectionPopupWindow: connectionPopupWindow_dropbox,
} = useDropboxFlogs();


// Using module-scoped state can cause problems with SSR. See 
// https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

watch(availableFlogs_dropbox, () => {
    // if availableFlogs_dropbox changes, filter out any openFlogs 
    // that are no longer in availableFlogs_dropbox
    if (openFlogs.value.length > 0) {
        const newOpenFlogs = openFlogs.value.filter(flog => {
            return availableFlogs_dropbox.value.reduce((p, c) => {
                return p || ((c.sourceType == flog.sourceType) && (c.url == flog.url))
            }, false);
        });
        openFlogs.value = newOpenFlogs;
    }
})


export const useFlogs = (): IFlogs => {

    const availableFlogs = ref<IFlog[]>([]);
    watch(
        availableFlogs_dropbox,
        () => {
            // replace dropbox flogs...
            availableFlogs.value = availableFlogs.value
                // first filtering existing out, 
                .filter((flog) => flog.sourceType != IFlogSourceType.dropbox)
                // then adding latest.
                .concat(availableFlogs_dropbox.value)
        }
        ,
        { immediate: true }
    )
    const availableRepoFlogs = ref<IFlog[]>([]);
    watch(
        availableRepoFlogs_dropbox,
        () => {
            // replace dropbox flogs...
            availableRepoFlogs.value = availableRepoFlogs.value
                // first filtering existing out, 
                .filter((flog) => flog.sourceType != IFlogSourceType.dropbox)
                // then adding latest.
                .concat(availableRepoFlogs_dropbox.value)
        }
        ,
        { immediate: true }
    )

    const addFlogToSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case IFlogSourceType.dropbox:
                addFlog_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const deleteFlogFromSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case IFlogSourceType.dropbox:
                deleteFlog_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const openFlog = (flog: IFlog,) => {
        if (!openFlogs.value.includes(flog)) {
            openFlogs.value.unshift(flog)
        }
    }

    const loadFlogEntriesFromSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case IFlogSourceType.dropbox:
                loadFlogEntries_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const saveFlogToSource = (flog: IFlog) => {
        switch (flog.sourceType) {
            case IFlogSourceType.dropbox:
                saveFlogEntries_dropbox(flog as IDropboxFlog)
                break;
            default:
        }
    }

    const closeFlog = (flog: IFlog) => {
        if (openFlogs.value.includes(flog)) {
            openFlogs.value = openFlogs.value.filter(flogItem => flog != flogItem)
        }
    }

    const updatePretext = (pretext: string, flog: IFlog) => {
        flog.pretext = pretext
    }

    const addEntryToFlog = (entry: IEntry, flog: IFlog) => {
        flog.loadedEntries.unshift(entry)
    }

    const editEntryFromFlog = (flog: IFlog, entry: IEntry) => {
        if (!flog || !Array.isArray(flog.loadedEntries)) {
            console.error(`Flog or flog.loadedEntries is undefined or not an array: ${flog}`);
            return;
        }
        // Find the index of the entry to delete
        const editEntryIndex = flog.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (editEntryIndex !== -1) {
            // Update the entry at the found index
            flog.loadedEntries[editEntryIndex] = { ...flog.loadedEntries[editEntryIndex], ...entry };
            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog);
        } else {
            console.error('Entry not found in flog.loadedEntries');
        }
    }

    const deleteEntryFromFlog = (flog: IFlog, entry: IEntry) => {
        if (!flog || !Array.isArray(flog.loadedEntries)) {
            console.error('Flog or flog.loadedEntries is undefined or not an array');
            return;
        }
        // Find the index of the entry to delete
        const deleteEntryIndex = flog.loadedEntries.findIndex(flogEntry => flogEntry.id === entry.id);
        if (deleteEntryIndex !== -1) {
            // Remove the entry
            flog.loadedEntries.splice(deleteEntryIndex, 1);

            // Save the updated flog to the source to persist the changes
            saveFlogToSource(flog);
        } else {
            console.error('Entry not found in flog.loadedEntries');
        }
    };

    const accountOwner = ref<Map<IFlogSourceType, string | null>>(
        new Map<IFlogSourceType, string | null>([
            [IFlogSourceType.dropbox, null],
            [IFlogSourceType.localFile, null],
        ])
    );
    watch(accountOwner_dropbox,
        () => {
            console.log('watch accountOwner_dropbox', accountOwner_dropbox)
            accountOwner.value.set(IFlogSourceType.dropbox, accountOwner_dropbox.value)
            // accountOwner.value.set(IFlogSourceType.localFile, TBD)
        },
        { immediate: true }
    )

    const launchConnectFlow = (sourceType: IFlogSourceType) => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                launchConnectFlow_dropbox();
                break;
            default:
        }
    }

    const openPopup = (sourceType: IFlogSourceType) => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                openDbxPopup_dropbox();
                break;
            default:
        }
    }

    const clearConnection = (sourceType: IFlogSourceType) => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                clearConnection_dropbox();
                break;
            default:
        }
    }

    const hasConnection = ref<Map<IFlogSourceType, boolean>>(
        new Map<IFlogSourceType, boolean>([
            [IFlogSourceType.dropbox, false],
            [IFlogSourceType.localFile, false],
        ])
    );
    watch(hasConnection_dropbox,
        () => {
            console.log('watch hasConnection_dropbox', hasConnection_dropbox)
            hasConnection.value.set(IFlogSourceType.dropbox, hasConnection_dropbox.value)
            // hasConnection.value.set(IFlogSourceType.localFile, TBD)
        },
        { immediate: true }
    )

    const connectionPopupWindow = ref<Map<IFlogSourceType, any>>(
        new Map<IFlogSourceType, any>([
            [IFlogSourceType.dropbox, undefined],
            [IFlogSourceType.localFile, undefined],
        ])
    );
    watch(connectionPopupWindow_dropbox,
        () => {
            console.log('watch connectionPopupWindow_dropbox', connectionPopupWindow_dropbox)
            connectionPopupWindow.value.set(IFlogSourceType.dropbox, connectionPopupWindow_dropbox.value)
            // hasConnection.value.set(IFlogSourceType.localFile, TBD)
        },
        { immediate: true }
    )


    return {
        availableFlogs,
        availableRepoFlogs,

        addFlogToSource,
        deleteFlogFromSource,

        openFlogs,

        openFlog,
        loadFlogEntriesFromSource,
        saveFlogToSource,
        closeFlog,

        addEntryToFlog,
        updatePretext,
        editEntryFromFlog,
        deleteEntryFromFlog,

        accountOwner,

        launchConnectFlow,
        openPopup,
        clearConnection,
        connectionPopupWindow,
        hasConnection,
    }
}
