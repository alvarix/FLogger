import { ref, watch } from "vue"
import type { Ref } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogStatus, IFlogSourceType } from "@/modules/Flog"
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import type { IDropboxFlog } from "@/composables/useDropboxFlogs";

// Re-export these for convenience
export type { IFlog as IFlog }
export { IFlogStatus as IFlogStatus }
export { IFlogSourceType as IFlogSourceType }

// useFlogSource returns the refs and operations defined in IFlogSource
// It includes:
//  - refs for available flogs
//  - operations for flogs at the source (add, load, save, delete)
//  - a ref for the accountOwner
//  - refs and operations for the connection to the source

export interface IFlogSource {

    // ***************
    // AVAILABLE FLOGS
    // ***************

    // useFlogSource provides and manages one array for all available non-repo flogs 
    // from all sources.
    availableFlogs: Ref<IFlog[]>;
    // useFlogSource provides and manages one array for all available repo flogs 
    // from all sources.
    availableRepoFlogs: Ref<IFlog[]>;

    // ***************
    // FLOG OPERATIONS
    // ***************

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

    // ****************************
    // SOURCE CONNECTION OPERATIONS
    // ****************************

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

    // eslint-disable-next-line
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


// Defining all ref variables at the module scope 
// (meaning at the root of this module file, 
// outside of the useComposable function that gets called by the importer),
// Creating ref variables at module scope makes them singletons shared by all composable importers.
// Otherwise, each composable importer gets its own instances of each ref variable.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
// Using module-scoped state requires special handling with SSR, if we ever want SSR.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const availableFlogs = ref<IFlog[]>([]);
const availableRepoFlogs = ref<IFlog[]>([]);
const accountOwner = ref<string | null>(null);
const hasConnection = ref<boolean>(false);
// eslint-disable-next-line
const connectionPopupWindow = ref<any>();

// Ref variables that are passed through from a specific use[Source]Flogs composable
// need watchers on source variables
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
watch(accountOwner_dropbox,
    () => {
        console.log('watch accountOwner_dropbox', accountOwner_dropbox)
        accountOwner.value = accountOwner_dropbox.value
    },
    { immediate: true }
)
watch(hasConnection_dropbox,
    () => {
        console.log('watch hasConnection_dropbox', hasConnection_dropbox)
        hasConnection.value = hasConnection_dropbox.value
    },
    { immediate: true }
)
watch(connectionPopupWindow_dropbox,
    () => {
        console.log('watch connectionPopupWindow_dropbox', connectionPopupWindow_dropbox)
        connectionPopupWindow.value = connectionPopupWindow_dropbox.value
    },
    { immediate: true }
)



export const useFlogSource = (sourceType: IFlogSourceType): IFlogSource => {

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

    const launchConnectFlow = () => {
        switch (sourceType) {
            case IFlogSourceType.dropbox:
                launchConnectFlow_dropbox();
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
