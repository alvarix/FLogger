<script setup lang="ts">
import { ref } from "vue";
import Entry from "./Entry.vue";
import { IEntry } from '../modules/EntryData'

const props = defineProps<{
  entries: Array<IEntry>;
}>();
</script>

<template>
  
  <ul class="entry-list">
    <li v-for="entry in entries">
      <Entry :entry="entry" />
    </li>
  </ul>
</template>

<style scoped>
.entry-list > li {
  border-radius: 14px;
  list-style: none;
  margin-top: 10px;

}
</style>
