<template>
  <div>
    <h1>FLogger!</h1>
		<NoteList :notes="testNotes" />
		<AddNote @newNote='addNewNote' :date="timestamp" />
  </div>
</template>

<script>
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";
import NoteData from './modules/NoteData.js';

export default {
  components: {
    NoteList,
    AddNote
  },

  data() {
    return {
      testNotes: [
				new NoteData(
					new Date("7/6/2022").toLocaleDateString(),
					['tag1','tagggg'], 
					'this is texty'
				),
			]
    };
  },

  methods: {
		addNewNote(noteData) {
			this.testNotes.push ({ 
				date: Date(noteData.timestamp),
				tags: noteData.tags.split(" "),
				entry: noteData.entry
			});


		}
  },
};
</script>

<style scoped></style>
