<template>
  <div>
    <h1>FLogger!</h1>
  </div>
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
        <button ref="fh" @click="dataFileClickToOpen">select a data file</button>
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

const {
  dataFileName,
  dataFilePermissions,
  dataFileClickToOpen,
  dataFileClickToRequestPermission,
  dataFileSave,
  dataFileClose,
} = useDataFile(loadData);

// // COMPOSITION API: Doesn't use export default
// export default {

// // COMPOSITION API: Doesn't need the imported components declared
//   components: {
//     NoteList,
//     AddNote,
//   },

// // COMPOSITION API: Reactive data are created using ref()
//   data() {
//     return {
//       timestamp: new Date().toLocaleDateString(),
//       testNotes: [
//       {
//           timestamp: new Date("7/6/2023").toLocaleDateString(),
//           tags: ["tag 1", "tag 2"],
//           message: "This is the note body message.",
//         },
//        // {
//          // timestamp: new Date(),
//           //tags: ["tag 1", "tag 3"],
//           //message: "This is the note TWO body message.",
//         //},
//       ],
//     };
//   },
const timestamp = ref(new Date().toLocaleDateString());

const testNotes = ref([
  // {
  //   timestamp: new Date("7/6/2023").toLocaleDateString(),
  //   tags: ["tag 1", "tag 2"],
  //   message: "This is the note body message.",
  // },
  // {
  // timestamp: new Date(),
  //tags: ["tag 1", "tag 3"],
  //message: "This is the note TWO body message.",
  //},
]);

// // COMPOSITION API: Methods are declared as normal-looking functions.
//   methods: {
// 		addNewNote(noteData) {
// 			this.testNotes.push ({
// 				timestamp: Date(noteData.timestamp),
// 				tags: noteData.tags.split(" "),
// 				message: noteData.entry
// 			});
// 		}
//   },
function addNewNote(noteData) {
  // // COMPOSITION API: "this." isn't necessary to reference reactive state vars, but ".value" is
  testNotes.value.push({
    timestamp: Date(noteData.timestamp),
    tags: noteData.tags.split(" "),
    message: noteData.entry,
  });
  dataFileSave({ notes: testNotes.value });
}

function closeDataFile() {
  dataFileClose();
  testNotes.value = [];
}

function loadData(dataObj) {
  if (dataObj?.notes) {
    testNotes.value = dataObj.notes;
  }
}

// // COMPOSITION API: Doesn't use export default
// };
</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
