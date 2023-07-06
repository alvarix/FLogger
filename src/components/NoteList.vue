<script>
import Note from "./Note.vue";

export default {
  name: "NoteList",
  components: { Note },
  props: {
    notes: {
      type: Array,
      required: true,
      default: []
    },
  },
};
</script>

<template>
  <h2>Note List</h2>
  <ul class="note-list">
    <li v-for="(note) in notes">
      <Note :note="note" />
    </li>
  </ul>
</template>

<style scoped>
.note-list > li {
  border-radius: 14px;
  list-style: none;
  padding: 0.5em;
  margin: 0.5em;
}
</style>
