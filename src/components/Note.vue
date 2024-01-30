<script setup>
import { ref } from "vue";
import NoteData from '../modules/NoteData.ts';

const props = defineProps({
	note: NoteData
})


</script>

<template>
  <div class="note">
    <div class="grid">
      <div class="grid-box"><b>timestamp:</b></div>

      <div class="grid-box">{{ note.date }}</div>

      <div class="grid-box"><b>message:</b></div>

      <div class="grid-box">{{ note.entry }}</div>
    </div>
  </div>
</template>

<style scoped>
.note {
  text-align: left;
  max-width: 490px;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid black;
}
.grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(
    auto-fill,
    minmax(100px, 1fr) minmax(200px, 2fr)
  );
}
.grid-box {
  background-color: #444;
  color: #fff;
  border-radius: 5px;
  padding: 20px;
  font-size: 150%;
}

.grid-box:nth-child(even) {
  background-color: #ccc;
  color: #000;
}
</style>
