<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <div v-if="openFlogs.length == 0">
    <Suspense>
      <DropBoxFlogs />
    </Suspense>
    <br />
    <hr />
    <LocalFileFlogs />
    <br />
    <hr />
  </div>
  <OpenFlogs />
  <br />
  <hr />
  <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" />
  <EntryList :entries="loadedEntries" />
</template>

<script setup>
import { ref } from "vue";
import EntryList from "@/components/EntryList.vue";
import AddEntry from "@/components/AddEntry.vue";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import LocalFileFlogs from "@/components/LocalFileFlogs.vue";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";

const { openFlogs } = useFlogs();
const { loadedEntries, loadEntries, loadEntry } = useLoadedEntries();

const timestamp = ref(new Date().toLocaleDateString());

function addNewEntry(entryData) {
  console.log('Not implemented yet')
}

</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
