<template>
  <aside class="vue-file">Flog.vue</aside>
  <section class="container main">
    <h4 class="flog-title">
      {{ flog.url }}

      <Pretext
        :pretext="flog.pretext"
        :readOnly="flog.readOnly"
        @update-pretext="
          (updatedPretext) => handleUpdatePretext(flog, updatedPretext)
        "
      />
      <button class="small close-flog" @click.prevent="() => closeFlog(flog)">
        flog list
      </button>
    </h4>

    <AddEntry
      @newEntry="(entryData) => addNewEntry(unref(entryData), flog)"
      :entryValue="addEntryValue"
    />
    <div id="spinner">
      <PacmanLoader
        :loading="flog.status != IFlogStatus.loaded"
        :color="loaderProps.color"
        :size="loaderProps.size"
      />
    </div>
    <div v-if="flog.status == IFlogStatus.loaded">
      <EntryList
        :entries="flog.loadedEntries"
        :editingEntry="getFlogEditingEntry(flog)"
        :readOnly="flog.readOnly"
        @edit-entry="editEntry"
        @copy-entry="handleCopyEntry"
        @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
        @update-entry="(entry) => handleUpdateEntry(flog, entry)"
        @start-editing="(entry) => handleStartEditingEntry(flog, entry)"
        @stop-editing="() => handleStopEditingEntry(flog)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, unref, computed } from "vue";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import { useFlog, IFlogStatus } from "@/composables/useFlog";
import EntryData, { IEntry } from "@/modules/EntryData";
import type { IFlog } from "@/modules/Flog";
import AddEntry from "@/components/AddEntry.vue";
import EntryList from "@/components/EntryList.vue";
import Pretext from "@/components/Pretext.vue";
import PacmanLoader from "vue-spinner/src/PacmanLoader.vue";

const props = defineProps<{
  flog: IFlog; // Accept the flog as a prop
}>();

const {
  closeFlog,
  saveFlogToSource,
} = useOpenFlogs();

const {
  addEntry,
  updatePretext,
  deleteEntry,
  editEntry,
} = useFlog(props.flog);

const addEntryValue = ref(null); // Initialize reactive addEntryValue
const isEditingFlogEntries = ref(new Map<IFlog, IEntry>()); // Keep a map of [flog, index] pairs to look up index of entry being edit PER flog
const getFlogEditingEntry = (flog: IFlog): IEntry | undefined =>
  isEditingFlogEntries.value.get(flog);

function addNewEntry(entryData: IEntry, flog: IFlog) {
  const newEntry = new EntryData(new Date(entryData.date), entryData.entry);
  addEntry(newEntry);
  saveFlogToSource(flog);
  isEditingFlogEntries.value.set(flog, newEntry);
  addEntryValue.value = undefined;
  // alert("New entry added");
}

const handleStartEditingEntry = (flog: IFlog, entry: IEntry) => {
  // console.log('handleStartEditingEntry', entry)
  isEditingFlogEntries.value.set(flog, entry);
};

const handleStopEditingEntry = (flog: IFlog) => {
  // console.log('handleStopEditingEntry')
  isEditingFlogEntries.value.set(flog, undefined);
  isEditingFlogEntries.value.delete(flog);
};

const handleCopyEntry = (entry: IEntry) => {
  addEntryValue.value = entry;
  alert("Your entry was copied into the editor");
};

// Handle entry deletion with confirmation
const handleDeleteEntry = (flog: IFlog, entry: IEntry) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this entry?"
  );

  // If the user confirms deletion, proceed with removing the entry
  if (confirmDelete) {
    deleteEntry(entry); // Delete the entry
    console.log("Entry deleted successfully");
  } else {
    console.log("Entry deletion canceled");
  }
};

// Function to handle the update event from the grandchild and update flog
const handleUpdateEntry = (flog: IFlog, updatedEntry: IEntry) => {
  // console.log("handleUpdateEntry() in grandparent called");
  // console.log("Received updated entry:", updatedEntry);

  if (flog) {
    editEntry(updatedEntry);
    isEditingFlogEntries.value.delete(flog);
    // console.log("deleting", isEditingFlogEntries.value.delete(flog));
    // = new Map([]); // Create a new map with one entry rather than track multiple entries being edited across flogs at the same time
  } else {
    console.error("flog is not defined or initialized");
  }
};

const getTimestamp = () => ref(new Date().toLocaleDateString("en-US"));

const loaderProps = {
  size: undefined,
  color: undefined,
};

// Function to catch update from child and emit to grandparent
function handleUpdatePretext(flog: IFlog, updatedPretext: string) {
  if (flog && !flog.readOnly) {
    // console.log("handleUpdatePretext() called");
    // console.log("new pretext:", updatedPretext);
    updatePretext(updatedPretext);
    saveFlogToSource(flog);
  }
}
const emit = defineEmits(["FlogList"]);
function closeFlogHandler() {
  emit("FlogList");
}
</script>

<style scoped lang="styl">
#spinner {
  text-align: left;
  width: 100%;
  padding: 1rem;
}

h4
  margin 10px 0 10px
  padding 0 0 10px 0
  font-style italic

.no-margin-bottom {
  margin-bottom: 0px;
}
h5 {
  padding: 0;
}

button.small
  margin-left 10px
</style>
