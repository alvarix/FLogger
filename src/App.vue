<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <Suspense>
    <DropBoxFiles />
  </Suspense>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="loadedNotes" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFile } from "./modules/useDataFile.js";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";
import DropBoxFiles from "./components/DropBoxFiles.vue";
import NoteData from "./modules/NoteData.ts";
import { useLoadedNotes } from "./composables/useLoadedNotes.ts";

const { loadedNotes, loadNotes, loadNote } = useLoadedNotes();

const timestamp = ref(new Date().toLocaleDateString());

function addNewNote(noteData) {
  //console.log(noteData)
  loadNote(
    new NoteData(
      new Date(noteData.value.date).toLocaleDateString(),
      noteData.value.entry
    )
  );
  dataFileSave({
    notes: loadedNotes.value,
  });
}

const {
  dataFileName,
  dataFilePermissions,
  dataFileClickToOpen,
  dataFileClickToRequestPermission,
  dataFileSave,
  dataFileClose,
} = useDataFile(loadData);
// That above is called a destructure assignment.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
// It is shorthand for this:
//   const dataFile = useDataFile(loadData);
//   const dataFileName = dataFile.dataFileName;
//   const dataFilePermissions = dataFile.dataFilePermissions;
//   const dataFileClickToOpen = dataFile.dataFileClickToOpen;
//   const dataFileClickToRequestPermission = dataFile.dataFileClickToRequestPermission;
//   const dataFileSave = dataFile.dataFileSave;
//   const dataFileClose = dataFile.dataFileClose;

function closeDataFile() {
  console.log("closeDataFile");
  dataFileClose();
  loadNotes([]);
}

function loadData(dataFileObject) {
  console.log("loadData", dataFileObject);
  if (dataFileObject?.notes) {
    loadNotes(
      dataFileObject.notes.map((note) => {
        return new NoteData(note.date, note.entry);
      })
    );
  }
}
</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
