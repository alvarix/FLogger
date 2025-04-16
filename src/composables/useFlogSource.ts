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

    // useFlogSource provides and manages one array for all available non-repo flogs 
    // from all sources.
    availableFlogs: Ref<IFlog[]>;
    // useFlogSource provides and manages one array for all available repo flogs 
    // from all sources.
    availableRepoFlogs: Ref<IFlog[]>;

    // useFlogSource provides the following flog operations
    //      add, delete
    // These map the operation to correct operation 
    // for the flog's source
    // 
    // The following are functions that take a flog
    // and call the appropriate pass through function
    // from use[flog.sourceType]Flogs
    addFlogToSource: (flog: IFlog) => void;
    loadFlogEntriesFromSource: (flog: IFlog) => void;
    saveFlogToSource: (flog: IFlog) => void;
    deleteFlogFromSource: (flog: IFlog) => void;

    // **************
    // SOURCE ACCOUNT
    // **************

    // useFlogSource provides a ref of the source accountOwner.
    // The value contains the pass through ref the corresponding 
    // corresponding source based on the sourceType param in
    // useSourceType(sourceType).
    accountOwner: Ref<string | null>;

    // *****************
    // SOURCE CONNECTION OPERATIONS
    // *****************

    // useFlogSource provides the following source operations
    //      launchConnectFlow, openPopup, clearConnection
    // These operations map to the correct source operation based
    // on the sourceType param in useSourceType(sourceType).
    // The naming of these could be improved, or generalized 
    // to make sense for multiple sources. 
    launchConnectFlow: () => void;
    openPopup: () => void;
    clearConnection: () => void;

    // useFlogSource provides a hasConnection boolean.
    // The value contains the pass through ref the corresponding 
    // corresponding source based on the sourceType param in
    // useSourceType(sourceType).
    hasConnection: Ref<boolean>;

    // useFlogSource provides a Map of connectionPopupWindows per source.
    // Each value contains the pass through ref values from its 
    // corresponding source.
    // 
    // The value of each connectionPopupWindow ref is the popup window object 
    // for that source, when there is one open.
    // Trying to access the window object properties while that window is 
    // at a dropbox URL will throw CORS errors.
    connectionPopupWindow: Ref<any>;
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


export const useFlogSource = (sourceType: IFlogSourceType): IFlogs => {

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

    const accountOwner = ref<string | null>(null);
    watch(accountOwner_dropbox,
        () => {
            console.log('watch accountOwner_dropbox', accountOwner_dropbox)
            accountOwner.value = accountOwner_dropbox.value
        },
        { immediate: true }
    )

    const launchConnectFlow = () => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                break;
            default:
        }
    }

    const openPopup = () => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                openDbxPopup_dropbox();
                break;
            default:
        }
    }

    const clearConnection = () => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                clearConnection_dropbox();
                break;
            default:
        }
    }

    const hasConnection = ref<boolean>(false);
    watch(hasConnection_dropbox,
        () => {
            console.log('watch hasConnection_dropbox', hasConnection_dropbox)
            hasConnection.value = hasConnection_dropbox.value
        },
        { immediate: true }
    )

    const connectionPopupWindow = ref<any>();
    watch(connectionPopupWindow_dropbox,
        () => {
            console.log('watch connectionPopupWindow_dropbox', connectionPopupWindow_dropbox)
            connectionPopupWindow.value = connectionPopupWindow_dropbox.value
        },
        { immediate: true }
    )


    return {
        availableFlogs,
        availableRepoFlogs,

        addFlogToSource,
        loadFlogEntriesFromSource,
        saveFlogToSource,
        deleteFlogFromSource,

        accountOwner,

        launchConnectFlow,
        openPopup,
        clearConnection,
        connectionPopupWindow,
        hasConnection,
    }
}
