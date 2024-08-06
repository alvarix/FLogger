<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <Suspense>
    <DropBoxFiles />
  </Suspense>
  <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" />
  <EntryList :entries="loadedEntries" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFile } from "./modules/useDataFile.js";
import EntryList from "./components/EntryList.vue";
import AddEntry from "./components/AddEntry.vue";
import DropBoxFiles from "./components/DropBoxFiles.vue";
import EntryData from "./modules/EntryData.ts";
import { useLoadedEntries } from "./composables/useLoadedEntries.ts";

const { loadedEntries, loadEntries, loadEntry } = useLoadedEntries();

const timestamp = ref(new Date().toLocaleDateString());

const {
  dataFileName,
  dataFilePermissions,
  dataFileClickToOpen,
  dataFileClickToRequestPermission,
  dataFileSave,
  dataFileClose,
} = useDataFile(loadData);
// That above is called a destructure assignment.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
// It is shorthand for this:
//   const dataFile = useDataFile(loadData);
//   const dataFileName = dataFile.dataFileName;
//   const dataFilePermissions = dataFile.dataFilePermissions;
//   const dataFileClickToOpen = dataFile.dataFileClickToOpen;
//   const dataFileClickToRequestPermission = dataFile.dataFileClickToRequestPermission;
//   const dataFileSave = dataFile.dataFileSave;
//   const dataFileClose = dataFile.dataFileClose;

function addNewEntry(entryData) {
  //console.log(entryData)
  loadEntry(
    new EntryData(
      new Date(entryData.value.date).toLocaleDateString(),
      entryData.value.entry
    )
  );
  dataFileSave({
    entries: loadedEntries.value,
  });
}

function closeDataFile() {
  console.log("closeDataFile");
  dataFileClose();
  loadEntries([]);
}

function loadData(dataFileObject) {
  console.log("loadData", dataFileObject);
  if (dataFileObject?.entries) {
    loadEntries(
      dataFileObject.entries.map((entry) => {
        return new EntryData(entry.date, entry.entry);
      })
    );
  }
}
</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
