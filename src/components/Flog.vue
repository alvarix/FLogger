<script lang="ts">
/**
 * @description Display of Flog with edit controls
 * @props none
 * @emits {handleUpdatePretext} - Gathers updated pretext from child and emits to parent.
 * @slots none 
 * @computed none
 * @methods
 *  - handleUpdatePretext - Updates the pretext of a flog.
 *  - addNewEntry - Adds a new entry to a flog.
 *  - handleStartEditingEntry - Starts editing an entry in a flog.
 *  - handleStopEditingEntry - Stops editing an entry in a flog.
 *  - handleCopyEntry - Copies an entry to the editor.
 *  - handleDeleteEntry - Deletes an entry from a flog.
 *  - handleUpdateEntry - Updates an entry in a flog.
 *  - getTimestamp - Returns the current timestamp.
 *  - closeFlog - Closes a flog (imported from useFlogs.ts).
 * @watch none
 * @dependencies
 *   PacmanLoader - loader
 * @example
 *   <OpenFlogs />
 * @relationships
 *   @parent 
 *    App.vue - if authenticated and not in list view, displays default flog
 *   @children
 *    - AddEntry - Adds new entries to the flog.
 *    - EntryList - Displays the list of entries in the flog.
 *    - Pretext - Displays and updates the pretext of the flog.
 *   @siblings none
 * @imports
 *   @components
 *     - AddEntry from '@/components/AddEntry.vue' - Adds new entries to the flog.
 *     - EntryList from '@/components/EntryList.vue' - Displays the list of entries in the flog.
 *     - Pretext from '@/components/Pretext.vue' - Displays and updates the pretext of the flog.
 *   @composables
 *     - useFlogs from '@/composables/useFlogs' - Provides flog-related functionalities.
 *   @modules
 *     - EntryData from '@/modules/EntryData' - Represents entry data.
 *     - Flog from '@/modules/Flog' - Represents a flog.
 */
</script>
<template>
  <aside class="vue-file">Flog.vue</aside>
  <section class="container main">
    <div v-for="flog in openFlogs" :key="flog.url">
      <h4 class="flog-title">
        {{ flog.url }}

        <span v-if="flog.pretext?.trim() != ''">
          <Pretext
            :pretext="flog.pretext"
            :readOnly="flog.readOnly"
            @update-pretext="
              (updatedPretext) => handleUpdatePretext(flog, updatedPretext)
            "
          />
        </span>
        <button class="small close-flog" @click.prevent="() => closeFlog(flog)">
          flog list
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
        />
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

<script setup lang="ts">
import { ref, unref, computed } from "vue";
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

const addEntryValue = ref(null); // Initialize reactive addEntryValue
const isEditingFlogEntries = ref(new Map<IFlog, IEntry>()); // Keep a map of [flog, index] pairs to look up index of entry being edit PER flog
const getFlogEditingEntry = (flog: IFlog): IEntry | undefined =>
  isEditingFlogEntries.value.get(flog);

function addNewEntry(entryData: IEntry, flog: IFlog) {
  const newEntry = new EntryData(new Date(entryData.date), entryData.entry);
  addEntryToFlog(newEntry, flog);
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
    deleteEntryFromFlog(flog, entry); // Delete the entry
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
    editEntryFromFlog(flog, updatedEntry);
    isEditingFlogEntries.value.delete(flog);
    // console.log("deleting", isEditingFlogEntries.value.delete(flog));
    // = new Map([]); // Create a new map with one entry rather than track multiple entries being edited across flogs at the same time
  } else {
    console.error("flog is not defined or initialized");
  }
};

const getTimestamp = () => ref(new Date().toLocaleDateString());

const loaderProps = {
  size: undefined,
  color: undefined,
};

// Function to catch update from child and emit to grandparent
function handleUpdatePretext(flog: IFlog, updatedPretext: string) {
  if (flog && !flog.readOnly) {
    // console.log("handleUpdatePretext() called");
    // console.log("new pretext:", updatedPretext);
    updatePretext(updatedPretext, flog);
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
