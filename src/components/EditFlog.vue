<template>
  <aside class="vue-file">EditFlog.vue</aside>

  <div class="flex gap-8">

    <section class="container main">
      <div class="viewport">  
        <h4 class="flog-title">
    {{ flog.url }}
    
    <FlogPretext
    :pretext="flog.pretext"
    :read-only="flog.readOnly"
    @update-pretext="
      (updatedPretext) => handleUpdatePretext(flog, updatedPretext)
      "
    />
    <button class="small close-flog" @click.prevent="() => closeFlog(flog)">
    flog list
    </button>
  </h4>

        <AddEntry
        :entry-value="addEntryValue"
        @new-entry="(entryData) => addNewEntry(unref(entryData), flog)"
        />
        
      </div>
      



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
          :editing-entry="getFlogEditingEntry(flog)"
          :read-only="flog.readOnly"
          @edit-entry="editEntry"
          @copy-entry="handleCopyEntry"
          @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
          @update-entry="(entry) => handleUpdateEntry(flog, entry)"
          @start-editing="(entry) => handleStartEditingEntry(flog, entry)"
          @stop-editing="() => handleStopEditingEntry(flog)"
        />
      </div>
    </section>
    <section class="container">
      <div class="toc mb-7">
        <h2>Table of Contents (h1s)</h2>
          <PacmanLoader
            :loading="!tocLoaded"
            :color="loaderProps.color"
            :size="loaderProps.size"
          />
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, unref, onMounted } from "vue";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource";
import { useFlog, IFlogStatus } from "@/composables/useFlog";
import type { IFlog } from "@/composables/useFlog";
import EntryData from "@/modules/EntryData";
import type { IEntry } from "@/modules/EntryData";
import AddEntry from "@components/AddEntry.vue";
import EntryList from "@components/EntryList.vue";
import FlogPretext from "@components/FlogPretext.vue";
// @ts-expect-error - vue-spinner typing issue
import PacmanLoader from "vue-spinner/src/PacmanLoader.vue";

const props = defineProps<{
  flog: IFlog; // Accept the flog as a prop
}>();


let tocLoaded = ref(false);

const { closeFlog } = useOpenFlogs();

const { saveFlogToSource } = useFlogSource(IFlogSourceType.dropbox);

const { addEntry, updatePretext, deleteEntry, editEntry } = useFlog(props.flog);

const addEntryValue = ref<IEntry | undefined>(); // Initialize reactive addEntryValue
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


onMounted(() => {
  const toc = document.querySelector('.toc');
  if (!toc) return;

  const observer = new MutationObserver((mutations) => {
    // Look for added h1 nodes
    const headers = document.querySelectorAll('h1');
    if (headers.length > 0) {
      const list = document.createElement('ul');
      list.className = 'toc-list';
      headers.forEach((header, index) => {
        if (header.id === "logo") return;
        if (!header.id) {
          header.id = `heading-${index}`;
        }
        const listItem = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = `#${header.id}`;
        anchor.textContent = header.textContent || `Heading ${index + 1}`;
        listItem.appendChild(anchor);
        list.appendChild(listItem);
      });
      toc.appendChild(list);
      // Stop observing after we've built the TOC
      observer.disconnect();
      tocLoaded.value = true;
    }
  });

  // Start observing the document body for added nodes.
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

</script>

<style scoped>
#spinner {
  text-align: left;
  width: 100%;
  padding: 1rem;
}

.toc {
  scroll-behavior: smooth;
  position: fixed;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  max-width: 300px;
  
  h2 {
    margin-top:0
  } 

}


h4 {
  box-sizing: border-box;
  margin: 10px 0 10px;
  padding: 0 0 10px 0;
  font-style: italic;
}
.no-margin-bottom {
  margin-bottom: 0px;
}
h5 {
  padding: 0;
}

button.small{
  margin-left: 10px
  }
</style>
<style>
.toc-list li { 
  padding: 5px 0;
  list-style:circle;
  margin-left: 20px;
}
</style>