<script setup>
import { ref } from "vue";
import { useFlogs } from "@/composables/useFlogs";
import EntryData from '@/modules/EntryData.ts';
import AddEntry from "@/components/AddEntry.vue";
import EntryList from "@/components/EntryList.vue";

const { openFlogs, closeFlog, addEntryToFlog, saveFlogToSource } = useFlogs();
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

const handleCopyEntry = (entry) => {
  copiedEntry.value = entry;
}

const getTimestamp = () => ref(new Date().toLocaleDateString());
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <div v-for="flog in openFlogs" :key="flog.id">
      <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" :copiedEntry="copiedEntry" />
      <h4>{{ flog.url }}</h4>
      <button @click.prevent="() => closeFlog(flog)">close flog</button>
      <AddEntry
        @newEntry="(entryData) => addNewEntry(entryData, flog)"
        :timestamp="getTimestamp()"
      />
      <EntryList :entries="flog.loadedEntries" @copy-entry="handleCopyEntry" />
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
