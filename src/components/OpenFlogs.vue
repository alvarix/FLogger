<script setup>
import { ref } from "vue";
import { useFlogs } from "@/composables/useFlogs";
import EntryData from "@/modules/EntryData.ts";
import AddEntry from "@/components/AddEntry.vue";
import EntryList from "@/components/EntryList.vue";
import Pretext from "@/components/Pretext.vue";

const {
  openFlogs,
  closeFlog,
  addEntryToFlog,
  deleteEntryFromFlog,
  editEntryFromFlog,
  saveFlogToSource,
} = useFlogs();
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
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this entry?"
  );

  // If the user confirms deletion, proceed with removing the entry
  if (confirmDelete) {
    deleteEntryFromFlog(flog, entry); // Delete the entry
    console.log("Entry deleted successfully");
  } else {
    console.log("Entry deletion canceled");
  }
};

// Function to handle the update event from the grandchild and update flog
const handleUpdateEntry = (flog, updatedEntry) => {
  console.log("handleUpdateEntry() in grandparent called");
  console.log("Received updated entry:", updatedEntry);

  if (flog) {
    editEntryFromFlog(flog, updatedEntry);
  } else {
    console.error("flog is not defined or initialized");
  }
};

const getTimestamp = () => ref(new Date().toLocaleDateString());
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <div v-for="flog in openFlogs" :key="flog.id">
      <h4 class="flog-title">
        {{ flog.url }}

        <button class="small close-flog" @click.prevent="() => closeFlog(flog)">
          close flog
        </button>
      </h4>
      <div v-if="flog.pretext?.trim() != ''">
        <h5 class="no-margin-bottom">pretext</h5>
        <Pretext :pretext="flog.pretext"/>
      </div>
      <div v-else>
        <h5>no pretext</h5>
      </div>
      <AddEntry
        @newEntry="(entryData) => addNewEntry(entryData, flog)"
        :copiedEntry="copiedEntry"
        :timestamp="getTimestamp()"
      />
      <EntryList
        :entries="flog.loadedEntries"
        :isEditing="isEditing"
        :readOnly="flog.readOnly"
        @edit-entry="editEntryFromFlog"
        @copy-entry="handleCopyEntry"
        @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
        @update-entry="(entry) => handleUpdateEntry(flog, entry)"
      />
    </div>
  </section>
</template>

<style scoped>
h4 {
  padding: 0;
  margin-bottom: 0px;
}
.no-margin-bottom {
  margin-bottom: 0px;
}
h5 {
  padding: 0;
}

</style>
