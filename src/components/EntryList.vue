<script setup lang="ts">
import { ref } from "vue";
import Entry from "@/components/Entry.vue";
import { IEntry } from '@/modules/EntryData'
import { useFlogs } from "@/composables/useFlogs";

const props = defineProps<{
  entries: Array<IEntry>;
}>();


// Track the currently editing entry ID
const editingEntryId = ref(null);

// Function to check if the entry is in editing mode
const isEditingEntry = (index) => {
  return editingEntryId.value === index;
};

// Function to set the editing mode for a specific entry
const setEditing = (index) => {
  editingEntryId.value = index;
};

const emit = defineEmits([
  'copy-entry',
  'delete-entry', 
  'edit-entry',
  'update-entry'
]);

// Emit event to the grandparent
//const emit = defineEmits<{
 // (e: , updatedEntry: IEntry): void;
//}>();
function changeEntry(actionName,entry) {
  emit(`${actionName}-entry`, entry);
}


// Function to catch update from child and emit to grandparent
function updateEntry(updatedEntry: IEntry) {
  console.log('updateEntry() called');
  console.log('Forwarding updated entry to grandparent:', updatedEntry);
  emit('update-entry', updatedEntry);
}



</script>

<template>
  
  <ul class="entry-list">
    <li v-for="(entry, index) in entries" :key="index">
      <Entry 
        :entry="entry" 
        :isEditing="isEditingEntry(index)" 
        @update-entry="updateEntry"
        />
      <button class='entry__btn' @click="changeEntry('copy',entry)">Copy</button>
      <button class='entry__btn' @click="setEditing(index)">Edit</button>
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
