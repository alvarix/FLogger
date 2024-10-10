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
      <button @click="changeEntry('copy',entry)">Copy Entry</button>
      <button @click="changeEntry('delete',entry)">Delete Entry</button>
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
