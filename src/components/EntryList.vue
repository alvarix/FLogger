<script setup lang="ts">
import { ref } from "vue";
import Entry from "@/components/Entry.vue";
import { IEntry } from '@/modules/EntryData'

const props = defineProps<{
  entries: Array<IEntry>;
}>();

const emit = defineEmits(['copy-entry','delete-entry']);
function changeEntry(actionName,entry) {
  emit(`${actionName}-entry`, entry);
}

</script>

<template>
  
  <ul class="entry-list">
    <li v-for="entry in entries">
      <Entry :entry="entry" />
      <button class='entry__btn' @click="changeEntry('copy',entry)">Copy</button>
      <button class='entry__btn entry__btn--warn' @click="changeEntry('delete',entry)">Delete</button>
    </li>
  </ul>
</template>

<style scoped>
.entry-list > li {
  border-radius: 14px;
  list-style: none;
  margin-top: 10px;
}

button {
  cursor: pointer;
}

.entry__btn {
  font-size: 10px;
  padding: 2px 4px;
  margin: 3px 5px 0 0;
  color: #999;
  font-weight: bold;
  text-transform: uppercase;
}

.entry__btn:hover {
  color: #000
}

.entry__btn--warn:hover {
  color:red;
}

</style>
