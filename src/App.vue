<script setup>
import { devtools } from 'vue';
import Note from './components/Note.vue'
const testNote = {
  timestamp: new Date(),
  tags: ["tag 1", "tag 2"],
  message: "This is the note body message."
}
</script>

<template>
  <Note :note="testNote" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
