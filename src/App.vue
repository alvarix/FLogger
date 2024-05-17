<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <UserAuth/>
  <!-- <section class="container main">
    <p>This example shows how to use PKCE in the browser</p>
    <div id="pre-auth-section" style="display: none">
      <button onClick="doAuth()">Start PKCE Auth Flow</button>

      <p class="info">
        Once authenticated, it will use the access token to list the files in
        your root directory.
      </p>
    </div>

    <div id="authed-section" style="display: none">
      <p>
        You have successfully authenticated. Below are the contents of your root
        directory. They were fetched using the SDK and access token.
      </p>
      <ul id="files"></ul>
    </div>
  </section> -->
  <div class="m-3 p-5 border rounded-lg w-full">
    <h2>Data file</h2>
    <div v-if="dataFileName" class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileName:</div>
      <div>
        {{ dataFileName }}
      </div>
      <div class="float-left mr-4 font-bold">dataFilePermissions:</div>
      <div>
        {{ dataFilePermissions }}
      </div>
      <div>
        <button @click="closeDataFile">close file</button>
      </div>
    </div>
    <div
      v-if="dataFilePermissions == 'prompt'"
      class="m-3 p-3 border border-red-700 rounded-md"
    >
      <div class="float-left mr-4 font-bold">File activation required:</div>
      <div>
        <button @click="dataFileClickToRequestPermission">grant access</button>
      </div>
    </div>
    <div
      v-else-if="!['prompt', 'granted'].includes(dataFilePermissions)"
      class="m-3 p-3"
    >
      <!-- <div class="float-left mr-4 font-bold">v2_fileHandle picker:</div> -->
      <div>
        <button ref="fh" @click="dataFileClickToOpen">
          select a data file
        </button>
      </div>
    </div>
    <!-- <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v2_fileDataStr:</div>
      <div>
        {{ v2_fileDataStr }}
      </div>
    </div> -->
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFile } from "./modules/useDataFile.js";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";
import UserAuth from "./components/UserAuth.vue";
import NoteData from "./modules/NoteData.ts";

const timestamp = ref(new Date().toLocaleDateString());
const testNotes = ref([
  new NoteData(
    new Date("7/6/2023").toLocaleDateString(),
    ["tag 1", "tag 2"],
    "This is the note body message."
  ),
]);

function addNewNote(noteData) {
  //console.log(noteData)
  testNotes.value.push(
    new NoteData(
      new Date(noteData.value.date).toLocaleDateString(),
      noteData.value.tags.split(" "),
      noteData.value.entry
    )
  );
  dataFileSave({
    notes: testNotes.value
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
  console.log('closeDataFile');
  dataFileClose();
  testNotes.value = [];
}

function loadData(dataFileObject) {
  console.log('loadData', dataFileObject);
  if (dataFileObject?.notes) {
    testNotes.value = dataFileObject.notes.map((note) => {
      return new NoteData(note.date, note.tags, note.entry);
    });
  }
}
</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
