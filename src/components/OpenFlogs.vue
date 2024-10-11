<script setup>
import { ref } from "vue";
import { useFlogs } from "@/composables/useFlogs";
import EntryData from "@/modules/EntryData.ts";
import AddEntry from "@/components/AddEntry.vue";
import EntryList from "@/components/EntryList.vue";

const { openFlogs, closeFlog, addEntryToFlog, deleteEntryFromFlog ,saveFlogToSource } = useFlogs();
// const props = defineProps({});

function addNewEntry(entryData, flog) {
  const newEntry = new EntryData(
    new Date(entryData.value.date),
    entryData.value.entry
  );
  addEntryToFlog(newEntry, flog);
  saveFlogToSource(flog);
}
const copiedEntry = ref(null); // Initialize reactive copiedEntry
let isEditing = ref(false);

const handleCopyEntry = (entry) => {
  copiedEntry.value = entry;
};


// Handle entry deletion with confirmation
const handleDeleteEntry = (flog, entry) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
  
  // If the user confirms deletion, proceed with removing the entry
  if (confirmDelete) {
    deleteEntryFromFlog(flog, entry); // Delete the entry
    console.log('Entry deleted successfully');
  } else {
    console.log('Entry deletion canceled');
  }
};

const getTimestamp = () => ref(new Date().toLocaleDateString());
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <div v-for="flog in openFlogs" :key="flog.id">
      <h4>{{ flog.url }}</h4>
      <button @click.prevent="() => closeFlog(flog)">close flog</button>
      <AddEntry
        @newEntry="(entryData) => addNewEntry(entryData, flog)"
        :copiedEntry="copiedEntry"
        :timestamp="getTimestamp()"
      />
      <EntryList :entries="flog.loadedEntries" 
      :isEditing = "isEditing"
      @copy-entry="handleCopyEntry" 
      @delete-entry="(entry) => handleDeleteEntry(flog, entry)" 
      />
    </div>
  </section>
</template>

<style scoped>
#add-entry *:not(.date-validation) {
  display: block;
}

input.error {
  border: 1px solid red;
}

.date-validation.error {
  display: block;
  color: red;
}

#add-entry label {
  margin-top: 20px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  padding: 0.5em;
  margin: 0.5em;
}
</style>
