import { ref } from "vue";
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useDataFileStore = defineStore('dataFile', () => {
  // const count = ref(0)
  // const name = ref('Eduardo')
  // const doubleCount = computed(() => count.value * 2)
  // function increment() {
  //   count.value++
  // }
  // return { count, name, doubleCount, increment }
  const file = useLocalStorage(
    'file',
    undefined
  )
  return { file }
})