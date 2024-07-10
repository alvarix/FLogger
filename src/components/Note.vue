<script setup lang="ts">
import { ref } from "vue";
import { INote } from '../modules/NoteData'

const props = defineProps<{
  note: INote;
}>();
</script>

<template>
  <div class="note">
      <h3>{{ note.date }}</h3>

      <div><pre>{{ note.entry }}</pre></div>
  </div>
</template>

<style scoped>
h3 {
  font-weight: 700;
  margin-bottom: 20px;
  font-size: 14px;
}


.note {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid black;
}


</style>
