<script>
import { ref } from "vue";

export default {
  name: "Note",
  props: {
    note: {
      timestamp: Date,
      tags: [String],
      message: String,
    },
  },
  data() {
  		return {
		}
  } 
};
</script>

<template>
  <div class="note">
    <!-- 
      <div class="grid">
      <div class="grid-box">
        <div><b>timestamp:</b></div>
        <div>{{ note.timestamp }}</div>
      </div>
      <div class="grid-box">
        <div><b>tags:</b></div>
        <div v-for="tag in note.tags">{{ tag }}</div>
      </div>
      <div class="grid-box">
        <div><b>message:</b></div>
        <div>{{ note.message }}</div>
      </div>
    </div>

 -->
    <div class="grid">
      <div class="grid-box"><b>timestamp:</b></div>
      <div class="grid-box">{{ note.timestamp }}</div>
      <div class="grid-box"><b>tags:</b></div>
      <div class="grid-box">
        <div v-for="tag in note.tags">{{ tag }}</div>
      </div>
      <div class="grid-box"><b>message:</b></div>
      <div class="grid-box">{{ note.message }}</div>
    </div>
    <!-- <div class="flex">
      <div class="flex-column-1"><b>timestamp:</b></div>
      <div class="flex-column-2">{{ note.timestamp }}</div>
      <div class="flex-column-1"><b>tags:</b></div>
      <div class="flex-column-2" v-for="tag in note.tags">{{ tag }}</div>
      <div class="flex-column-1"><b>message:</b></div>
      <div class="flex-column-2">{{ note.message }}</div>
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
