<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <div class="p-5">
    <hr />
    <input
      id="filesInput"
      ref="filesInput"
      type="file"
      accept="text/*"
      @change="getTheFile"
    />
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFile:</div>
      <div>
        {{ dataFile ? dataFile.name : "no data file" }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileLoaded:</div>
      <div>
        {{ dataFileLoaded }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileText:</div>
      <div>
        {{ dataFileText ? dataFileText : "no data file text" }}
      </div>
    </div>
    <hr />
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFileStore } from "./stores/dataFile";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";

const dataFileStore = useDataFileStore();
// dataFileStore.dataFileLocation // <-- This will be used to save the location of the dataFile

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
  {
    timestamp: new Date("7/6/2023").toLocaleDateString(),
    tags: ["tag 1", "tag 2"],
    message: "This is the note body message.",
  },
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
}

// // COMPOSITION API: Doesn't use export default
// };

// New refs and functions for dataFile
const dataFile = ref(undefined);
const dataFileText = ref(undefined);
const dataFileLoaded = ref(false);

function getTheFile(event) {
  console.log(`getTheFile: `, event.target.files);
  for (const file of event.target.files) {
    dataFile.value = file;
    file.text().then((t) => {
      dataFileText.value = t;
      console.log(`dataFileText loaded: `, dataFileText.value);
      dataFileLoaded.value = true;
    });
  }
}
</script>

<style scoped></style>
