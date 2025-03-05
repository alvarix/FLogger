<script setup lang="ts">
import { ref, unref, onMounted } from "vue";
import { useFlogs, IFlogStatus } from "@/composables/useFlogs";
import EntryData, { IEntry } from "@/modules/EntryData";
import { IFlog } from "@/modules/Flog";
import AddEntry from "@/components/AddEntry.vue";
import EntryList from "@/components/EntryList.vue";
import Pretext from "@/components/Pretext.vue";
import PacmanLoader from "vue-spinner/src/PacmanLoader.vue";

const {
  openFlogs,
  closeFlog,
  addEntryToFlog,
  updatePretext,
  deleteEntryFromFlog,
  editEntryFromFlog,
  saveFlogToSource,
} = useFlogs();

const addEntryValue = ref(null); // Reactive value for addEntry input
const isEditingFlogEntries = ref(new Map<IFlog, IEntry>());
// Lookup editing entry per flog
const getFlogEditingEntry = (flog: IFlog): IEntry | undefined =>
  isEditingFlogEntries.value.get(flog);

/**
 * Adds a new entry to a flog.
 *
 * @param {IEntry} entryData - The entry data.
 * @param {IFlog} flog - The flog to which the entry is added.
 */
function addNewEntry(entryData: IEntry, flog: IFlog) {
  const newEntry = new EntryData(new Date(entryData.date), entryData.entry);
  addEntryToFlog(newEntry, flog);
  saveFlogToSource(flog);
  isEditingFlogEntries.value.set(flog, newEntry);
  addEntryValue.value = undefined;
}

/**
 * Handles starting the editing of an entry.
 *
 * @param {IFlog} flog - The flog where the entry resides.
 * @param {IEntry} entry - The entry being edited.
 */
const handleStartEditingEntry = (flog: IFlog, entry: IEntry) => {
  isEditingFlogEntries.value.set(flog, entry);
};

/**
 * Handles stopping the editing of an entry.
 *
 * @param {IFlog} flog - The flog where the entry resides.
 */
const handleStopEditingEntry = (flog: IFlog) => {
  isEditingFlogEntries.value.set(flog, undefined);
  isEditingFlogEntries.value.delete(flog);
};

/**
 * Copies an entry to the add entry editor.
 *
 * @param {IEntry} entry - The entry to copy.
 */
const handleCopyEntry = (entry: IEntry) => {
  addEntryValue.value = entry;
  alert("Your entry was copied into the editor");
};

/**
 * Deletes an entry after confirmation.
 *
 * @param {IFlog} flog - The flog where the entry resides.
 * @param {IEntry} entry - The entry to delete.
 */
const handleDeleteEntry = (flog: IFlog, entry: IEntry) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this entry?"
  );
  if (confirmDelete) {
    deleteEntryFromFlog(flog, entry);
    console.log("Entry deleted successfully");
  } else {
    console.log("Entry deletion canceled");
  }
};

/**
 * Handles updating an entry in a flog.
 *
 * @param {IFlog} flog - The flog where the entry resides.
 * @param {IEntry} updatedEntry - The updated entry.
 */
const handleUpdateEntry = (flog: IFlog, updatedEntry: IEntry) => {
  if (flog) {
    editEntryFromFlog(flog, updatedEntry);
    isEditingFlogEntries.value.delete(flog);
  } else {
    console.error("flog is not defined or initialized");
  }
};

/**
 * Returns the current timestamp as a localized date and time string.
 *
 * @returns {string} The current date and time.
 */
 function getTimestamp() {
  const now = new Date()
  // Combine the localized date and time strings
  return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
}

const loaderProps = {
  size: undefined,
  color: undefined,
};

/**
 * Handles updating the pretext for a flog.
 *
 * @param {IFlog} flog - The flog to update.
 * @param {string} updatedPretext - The new pretext.
 */
function handleUpdatePretext(flog: IFlog, updatedPretext: string) {
  if (flog && !flog.readOnly) {
    updatePretext(updatedPretext, flog);
    saveFlogToSource(flog);
  }
}

// If you need to do any client-only setup, you can still use onMounted here.
onMounted(() => {
  // Any additional onMounted logic here
});
</script>

<template>
  <section class="container main">
    <div v-for="flog in openFlogs" :key="flog.url">
      <h4 class="flog-title">
        {{ flog.url }}
        <span v-if="flog.pretext?.trim() != ''">
          <Pretext
            :pretext="flog.pretext"
            :readOnly="flog.readOnly"
            @update-pretext="(updatedPretext) => handleUpdatePretext(flog, updatedPretext)"
          />
        </span>
        <button class="small close-flog" @click.prevent="() => closeFlog(flog)">
          close flog
        </button>
      </h4>

      <AddEntry
        @newEntry="(entryData) => addNewEntry(unref(entryData), flog)"
        :entryValue="addEntryValue"
        :timestamp="getTimestamp()"
      />
      
      <div id="spinner">
        <PacmanLoader
          :loading="flog.status != IFlogStatus.loaded"
          :color="loaderProps.color"
          :size="loaderProps.size"
        /><br />
      </div>
      
      <div v-if="flog.status == IFlogStatus.loaded">
        <EntryList
          :entries="flog.loadedEntries"
          :editingEntry="getFlogEditingEntry(flog)"
          :readOnly="flog.readOnly"
          @edit-entry="editEntryFromFlog"
          @copy-entry="handleCopyEntry"
          @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
          @update-entry="(entry) => handleUpdateEntry(flog, entry)"
          @start-editing="(entry) => handleStartEditingEntry(flog, entry)"
          @stop-editing="() => handleStopEditingEntry(flog)"
        />
      </div>
    </div>
  </section>
</template>

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