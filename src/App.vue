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
    <LocalFileFlogs />
    <br />
    <hr />
  </div>
  <OpenFlogs />
  <br />
  <hr />
  <EntryList :entries="loadedEntries" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFile } from "@/modules/useDataFile";
import EntryList from "@/components/EntryList.vue";
import AddEntry from "@/components/AddEntry.vue";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import DropBoxFiles from "@/components/DropBoxFiles.vue";
import LocalFileFlogs from "@/components/LocalFileFlogs.vue";
import EntryData from "@/modules/EntryData.ts";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";

const { openFlogs } = useFlogs();
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

* {
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}
</style>
