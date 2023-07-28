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
import NoteData from './modules/NoteData.js';

const timestamp = ref(new Date().toLocaleDateString());
const testNotes = ref([
  	new NoteData(
			new Date("7/6/2023").toLocaleDateString(),
			["tag 1", "tag 2"],
			"This is the note body message.",
		)
]);

function addNewNote(noteData) {
	//console.log(noteData)
  testNotes.value.push(
		new NoteData(
		new Date(noteData.value.date).toLocaleDateString(),
		noteData.value.tags.split(" "),
		noteData.value.entry
		)
	)
}

</script>

<style scoped></style>
