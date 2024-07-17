<script setup lang="ts">
import { ref } from "vue";
import Note from "./Note.vue";
import { INote } from '../modules/NoteData'

const props = defineProps<{
  notes: Array<INote>;
}>();
</script>

<template>
  
  <ul class="note-list">
    <li v-for="note in notes">
      <Note :note="note" />
    </li>
  </ul>
</template>

<style scoped>
.note-list > li {
  border-radius: 14px;
  list-style: none;
  margin-top: 10px;

}
</style>
