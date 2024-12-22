<script setup lang="ts">
import { ref } from "vue";
import Entry from "@/components/Entry.vue";
import { IEntry } from '@/modules/EntryData'
import { useFlogs } from "@/composables/useFlogs";

const props = defineProps<{
  entries?: Array<IEntry>;
}>();


const emit = defineEmits([
  'copy-entry',
  'delete-entry', 
  'edit-entry',
  'update-entry'
]);

function changeEntry(actionName,entry) {
  emit(`${actionName}-entry`, entry);
}

// Function to catch update from child and emit to grandparent
function updateEntry(updatedEntry: IEntry) {
  console.log('updateEntry() called');
  console.log('Forwarding updated entry to grandparent:', updatedEntry);
  emit('update-entry', updatedEntry);
}

// Track the currently editing entry ID
const editingEntryId = ref(null);

// Function to check if the entry is in editing mode
const isEditingEntry = (index) => {
  return editingEntryId.value === index;
};

const editButtonText = ref('Edit');

// Function to set the editing mode for a specific entry
const setEditing = (index) => {
  editingEntryId.value = index;
  //toggleButton();
};

// Handle stop-editing event from the child component
const stopEditingEntry = (index) => {
  if (editingEntryId.value === index) {
    editingEntryId.value = null;  // Stop editing the entry
  }
};

// not used
// Toggle function that changes the button text and class
const toggleButton = () => {
  if (editButtonText.value === 'Edit') {
    editButtonText.value = 'Save';
    //editButtonClass.value = 'button-clicked';
  } else {
    editButtonText.value = 'Edit';
    //editButtonClass.value = 'button-normal';
  }
};

</script>

<template>
  
  <ul class="entry-list">
    <li v-for="(entry, index) in entries" :key="index">
      <Entry 
        :entry="entry" 
        :isEditing="isEditingEntry(index)" 
        @stop-editing="stopEditingEntry(index)" 
        @update-entry="updateEntry"

        />
      <button class='small entry__btn' @click="changeEntry('copy',entry)">Copy</button>
      <button class='small entry__btn' @click="setEditing(index)">{{ editButtonText }}</button>
      <button class='small entry__btn entry__btn--warn' @click="changeEntry('delete',entry)">Delete</button>
    </li>
  </ul>
</template>

<style scoped>
.entry-list > li {
  border-radius: 14px;
  list-style: none;
  margin-top: 10px;
}



.entry__btn:hover {
  color: #000
}

.entry__btn--warn:hover {
  color:red;
}

</style>
