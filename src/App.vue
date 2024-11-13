<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <div v-if="openFlogs.length == 0">
    <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" />
    <Suspense>
      <DropBoxFlogs />
    </Suspense>
    <br />
    <hr />
  </div>
  <OpenFlogs />
  <br />
  <hr />
  <EntryList :entries="loadedEntries || []" />
</template>

<script setup>
import { ref } from "vue";
import EntryList from "@/components/EntryList.vue";
import AddEntry from "@/components/AddEntry.vue";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";

const { openFlogs } = useFlogs();
const { loadedEntries, loadEntries, loadEntry } = useLoadedEntries();

const timestamp = ref(new Date().toLocaleDateString());

function addNewEntry(entryData) {
  console.log("Not implemented yet");
}
</script>

<style scoped>
h2 {
  font-size: 2em;
}

* {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
    "DejaVu Sans Mono", monospace;
}
</style>
