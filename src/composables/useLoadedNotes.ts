import { ref, onMounted, onUnmounted } from 'vue'
import { INote } from '../modules/NoteData'

// Global reactivy state, created in module scope, so it's shared by all consumers of this useLoadedNotes composable.
const loadedNotes = ref<INote[]>([])

export function useLoadedNotes() {
  // // If we instead defined loadedNotes here, it would be scoped to each consumer of useLoadedNotes
  // const loadedNotes = ref<INote[]>([])

  // a composable can update its managed state over time.
  function loadNotes(newNotesList: INote[]): void {
    loadedNotes.value = newNotesList;
  }
  function loadNote(newNote: INote): void {
    loadedNotes.value = [...loadedNotes.value, newNote];
  }
  function loadNotesFromString(stringNotesList: string | undefined): void {
    loadedNotes.value = stringNotesList ? deserializeNotes(stringNotesList) : [];
  }
  function serializeNotes(notesList: INote[]): string {
    return notesList.reduce<string>(
      (accumulatedValue, currentNote, index) => {
        return accumulatedValue + `\n\n${currentNote.date.toDateString()}\n${currentNote.entry}`
      }
      , '' //start accumulatedValue with an empty string
    )
  }
  function deserializeNotes(noteData: string): INote[] {
    const notesList: (INote | undefined)[] = noteData
      // split text file at date delimiters
      .split(/^\n?\n?([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4})\n|\n\n([0-1]?[0-9]\/[0-3]?[0-9]\/[0-9]{4})\n/)
      // filter out blank array entries (non-date and non-entry)
      .filter(item => item && item != '\n')
      // convert array of [date,entry,date,entry,...] into [{date, entry},{date, entry},...]
      .map<INote | undefined>((item, index, arr) => index % 2 == 0 ? { date: new Date(arr[index]), entry: arr[index + 1] } : undefined)
      // filter out undefined remnants
      .filter(item => !!item)
    return notesList as INote[]
  }

  // // a composable can also hook into its owner component's
  // // lifecycle to setup and teardown side effects.
  // onMounted(() => window.addEventListener('mousemove', update))
  // onUnmounted(() => window.removeEventListener('mousemove', update))

  // expose managed state as return value and methods
  return { loadedNotes, loadNotes, loadNote, loadNotesFromString, serializeNotes, deserializeNotes }
}
