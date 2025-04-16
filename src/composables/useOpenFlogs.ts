import { ref, Ref, watch } from "vue"
import type { IFlog } from "@/modules/Flog"
import { IFlogSourceType } from "@/modules/Flog"
import { useDropboxFlogs, IDropboxFlog } from "@/composables/useDropboxFlogs";


// Re-export these for convenience
export type { IFlog as IFlog }

interface IUseFlogs {
    // ***************
    // OPEN FLOGS
    // ***************

    // useOpenFlogs provides and manages one array for all open flogs 
    // from all sources.
    openFlogs: Ref<IFlog[]>;

    // useOpenFlogs provides the following flog operations
    //      add, delete
    // These map the operation to correct operation 
    // for the flog's source
    // 
    // The following are functions that take a flog
    // and call the appropriate pass through function
    // from use[flog.sourceType]Flogs
    openFlog: (flog: IFlog) => void;
    closeFlog: (flog: IFlog) => void;
}

const {
    saveFlogEntries: saveFlogEntries_dropbox,
    addFlog: addFlog_dropbox,
    availableFlogs: availableFlogs_dropbox
} = useDropboxFlogs();


// Using module-scoped state can cause problems with SSR. See 
// https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

watch(availableFlogs_dropbox, () => {
    // if availableFlogs changes, filter out any openFlogs 
    // that are no longer in availableFlogs
    if (openFlogs.value.length > 0) {
        const newOpenFlogs = openFlogs.value.filter(flog => {
            return availableFlogs_dropbox.value.reduce((p, c) => {
                return p || ((c.sourceType == flog.sourceType) && (c.url == flog.url))
            }, false);
        });
        openFlogs.value = newOpenFlogs;
    }
})

export const useOpenFlogs = () => {

    const openFlog = (newFlog: IFlog,) => {
        if (!openFlogs.value.includes(newFlog)) {
            openFlogs.value.unshift(newFlog)
        }
    }


    const closeFlog = (flog: IFlog) => {
        if (openFlogs.value.includes(flog)) {
            openFlogs.value = openFlogs.value.filter(flogItem => flog != flogItem)
        }
    }

    return {
        openFlogs,
        openFlog,
        closeFlog,
    }
}
