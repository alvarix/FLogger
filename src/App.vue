<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script setup>
import { ref } from "vue";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";

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
</script>

<style scoped></style>
