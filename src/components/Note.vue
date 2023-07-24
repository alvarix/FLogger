<script>
import { ref } from "vue";
import NoteData from "../modules/NoteData.ts";

export default {
  name: "Note",
  props: {
    note: NoteData,
  },
  data() {
    return {};
  },
};
</script>

<template>
  <div class="note">
    <!-- 
      <div class="grid">
      <div class="grid-box">
        <div><b>date:</b></div>
        <div>{{ note.date }}</div>
      </div>
      <div class="grid-box">
        <div><b>tags:</b></div>
        <div v-for="tag in note.tags">{{ tag }}</div>
      </div>
      <div class="grid-box">
        <div><b>entry:</b></div>
        <div>{{ note.entry }}</div>
      </div>
    </div>

 -->
    <div class="grid">
      <div class="grid-box"><b>date:</b></div>
      <div class="grid-box">{{ note.date }}</div>
      <div class="grid-box"><b>tags:</b></div>
      <div class="grid-box">
        <div v-for="tag in note.tags">{{ tag }}</div>
      </div>
      <div class="grid-box"><b>entry:</b></div>
      <div class="grid-box">{{ note.entry }}</div>
    </div>
    <!-- <div class="flex">
      <div class="flex-column-1"><b>date:</b></div>
      <div class="flex-column-2">{{ note.date }}</div>
      <div class="flex-column-1"><b>tags:</b></div>
      <div class="flex-column-2" v-for="tag in note.tags">{{ tag }}</div>
      <div class="flex-column-1"><b>entry:</b></div>
      <div class="flex-column-2">{{ note.entry }}</div>
    </div> -->
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
