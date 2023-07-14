<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <AddNote @newNote='addNewNote' :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script>
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";

export default {
  components: {
    NoteList,
    AddNote,
  },

  data() {
    return {
      timestamp: new Date().toLocaleDateString(),
      testNotes: [
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
      ],
    };
  },

  methods: {
		addNewNote(noteData) {
			this.testNotes.push ({ 
				timestamp: Date(noteData.timestamp),
				tags: noteData.tags.split(" "),
				message: noteData.entry
			});


		}
  },
};
</script>

<style scoped></style>
