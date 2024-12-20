import { ref, onMounted, onUnmounted } from 'vue'
import { IEntry } from '../modules/EntryData'

// Global reactivy state, created in module scope, so it's shared by all consumers of this useLoadedEntries composable.
const loadedEntries = ref<IEntry[]>([])

export function useLoadedEntries() {
  // // If we instead defined loadedEntries here, it would be scoped to each consumer of useLoadedEntries
  // const loadedEntries = ref<IEntry[]>([])

  // a composable can update its managed state over time.
  function loadEntries(newEntriesList: IEntry[]): void {
    loadedEntries.value = newEntriesList;
  }
  function loadEntry(newEntry: IEntry): void {
    loadedEntries.value = [...loadedEntries.value, newEntry];
  }
  function loadEntriesFromString(stringEntriesList: string | undefined): void {
    loadedEntries.value = stringEntriesList ? deserializeEntries(stringEntriesList) : [];
  }
  function serializeEntries(entriesList: IEntry[]): string {
    return entriesList.reduce<string>(
      (accumulatedValue, currentEntry, index) => {
        return accumulatedValue + `\n\n${currentEntry.date.toDateString()}\n${currentEntry.entry}`
      }
      , '' //start accumulatedValue with an empty string
    )
  }
  function deserializeEntries(entryData: string): IEntry[] {
    const entriesList: (IEntry | undefined)[] = entryData
      // split text file at date delimiters - MM/DD/YYYY or MM/DD/YY format
      .split(/^\n?\n?([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4}|[0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{2})\n/)
      // filter out blank array entries (non-date and non-entry)
      .filter(item => item && item != '\n')
      // convert array of [date,entry,date,entry,...] into [{date, entry},{date, entry},...]
      .map<IEntry | undefined>((item, index, arr) => index % 2 == 0 ? { date: new Date(arr[index]), entry: arr[index + 1] } : undefined)
      // filter out undefined remnants
      .filter(item => !!item)
    return entriesList as IEntry[]
  }

  // // a composable can also hook into its owner component's
  // // lifecycle to setup and teardown side effects.
  // onMounted(() => window.addEventListener('mousemove', update))
  // onUnmounted(() => window.removeEventListener('mousemove', update))

  // expose managed state as return value and methods
  return { loadedEntries, loadEntries, loadEntry, loadEntriesFromString, serializeEntries, deserializeEntries }
}
