<template>
  <div>
    <h1>Flogger!</h1>
  </div>
  <AddNote :timestamp="timestamp" />
  <Note :note="testNote" />
</template>

<script>
import Note from "./components/Note.vue";
import AddNote from "./components/AddNote.vue";

export default {
  components: {
    Note,
    AddNote,
  },

  data() {
    return {
      timestamp: Date.now(),
      testNote: {
        timestamp: new Date(),
        tags: ["tag 1", "tag 2"],
        message: "This is the note body message.",
      },
    };
  },

  methods: {},
};
</script>

<style scoped></style>
