import { ref } from "vue"
import { IFlog } from "@/modules/Flog"

// Using module-scoped state can cause problems with SSR. See 
// https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const openFlogs = ref<IFlog[]>([])

export const useFlogs = () => {

    const openFlog = (
        newFlog: IFlog,
    ) => {
        if (!openFlogs.value.includes(newFlog)) {
            const temp = openFlogs.value
            openFlogs.value.push(newFlog)
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
        closeFlog
    }
}
