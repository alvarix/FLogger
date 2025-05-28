<template>
  <aside class="vue-file">TagFlog.vue</aside>

  <h3>
    {{ flog.url }}
    <button class="small close-flog" @click.prevent="() => toggleShow()">
      {{ showFlog ? "hide" : "show" }}
    </button>
  </h3>
  <div v-if="showFlog">
    <div v-for="entry in matchedFlogEntries" :key="entry.date.toLocaleString()">
      <FlogEntry
        :key="entry.date.toDateString()"
        :flog="flog"
        :entry="entry"
        :read-only="flog.readOnly"
        :is-editing="isEditingFlogEntry == entry"
        @start-editing="() => handleStartEditingEntry(entry)"
        @stop-editing="() => handleStopEditingEntry()"
        @update-entry="(entry) => handleUpdateEntry(entry)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { TagFlogFile, TagEntryDate } from "@composables/useTags";
import {
  IFlogSourceType,
  useFlogSource,
  type IFlog,
} from "@composables/useFlogSource";
import type { IEntry } from "@/modules/EntryData";
import { useFlog } from "@composables/useFlog";
import FlogEntry from "./FlogEntry.vue";

const { flogFile, entryDates } = defineProps<{
  flogFile: TagFlogFile;
  entryDates: TagEntryDate[];
}>();

const showFlog = ref(true);
const toggleShow = () => {
  showFlog.value = !showFlog.value;
};

const { availableFlogs, loadFlogEntriesFromSource } =
  useFlogSource(IFlogSourceType.dropbox);

const loadedFlogs = ref<IFlog[]>([]);

const defaultPlaceholderFlog: IFlog = {
  sourceType: IFlogSourceType.localFile,
  url: "unknown",
  loadedEntries: [],
  readOnly: true,
};

const flog = ref<IFlog>(
  availableFlogs.value.reduce<IFlog | undefined>(
    (acc, current) => (current.url == flogFile ? current : acc),
    undefined
  ) || defaultPlaceholderFlog
);

watch(
  availableFlogs,
  () => {
    flog.value = availableFlogs.value.reduce<IFlog>(
      (acc, current) => (current.url == flogFile ? current : acc),
      defaultPlaceholderFlog
    );
  },
  { immediate: true, deep: true }
);

const { editEntry } = useFlog(flog.value);

const matchedFlogEntries = ref<IEntry[]>([]);

watch(
  flog,
  () => {
    if (flog.value) {
      loadedFlogs.value.push(flog.value);
      if (flog.value.loadedEntries.length == 0)
        loadFlogEntriesFromSource(flog.value);
    }
    const matchingEntries = flog.value?.loadedEntries.filter((loadedEntry) => {
      const entriesMap = entryDates.filter((tagEntryDate) => {
        return (
          new Date(tagEntryDate).toDateString() ==
          loadedEntry.date.toDateString()
        );
      });
      return entriesMap.length > 0;
    });
    matchedFlogEntries.value = matchingEntries || [];
  },
  { immediate: true, deep: true }
);

const isEditingFlogEntry = ref<IEntry | undefined>(); // Keep a map of [flog, index] pairs to look up index of entry being edit

const handleStartEditingEntry = (entry: IEntry) => {
  console.log("handleStartEditingEntry", entry);
  isEditingFlogEntry.value = entry;
};

const handleStopEditingEntry = () => {
  // console.log('handleStopEditingEntry')
  isEditingFlogEntry.value = undefined;
};

// Function to handle the update event from the grandchild and update flog
const handleUpdateEntry = (updatedEntry: IEntry) => {
  // console.log("handleUpdateEntry() in grandparent called");
  // console.log("Received updated entry:", updatedEntry);

  if (flog.value && !flog.value.readOnly) {
    editEntry(updatedEntry);
    isEditingFlogEntry.value = undefined;
    // console.log("deleting", isEditingFlogEntry.value.delete(flog));
    // = new Map([]); // Create a new map with one entry rather than track multiple entries being edited across flogs at the same time
  } else {
    console.error("flog is not defined or initialized");
  }
};
</script>

<style scoped>
.tag-list {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
</style>
