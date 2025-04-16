import { ref, Ref, watch } from "vue"
import type { IFlog } from "@/composables/useFlogSource"
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource";


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
    availableFlogs
} = useFlogSource(IFlogSourceType.dropbox);


// Defining all ref variables at the module scope 
// (meaning at the root of this module file, 
// outside of the useComposable function that gets called by the importer),
// Creating ref variables at module scope makes them singletons shared by all composable importers.
// Otherwise, each composable importer gets its own instances of each ref variable.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
// Using module-scoped state requires special handling with SSR, if we ever want SSR.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

// Ref variables that are passed through from a specific use[Source]Flogs composable
// need watchers on source variables
watch(availableFlogs, () => {
    // if availableFlogs changes, filter out any openFlogs 
    // that are no longer in availableFlogs
    if (openFlogs.value.length > 0) {
        const newOpenFlogs = openFlogs.value.filter(flog => {
            return availableFlogs.value.reduce((p, c) => {
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
