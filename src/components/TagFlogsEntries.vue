<template>
  <aside class="vue-file">TagFlogsEntries.vue</aside>

  <h2>Tagged entries in other flogs</h2>
  <div v-if="matchedFlogEntries.length == 0">none</div>
  <div v-else>
    <div
      v-for="[flog, entries] in matchedFlogEntries"
      :key="flog.url"
      class="mb-2"
    >
      <h3>{{ flog.url }}</h3>
      <div v-for="entry in entries" :key="entry.date.toLocaleString()">
        <FlogEntry :key="entry.date.toDateString()" :entry="entry" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Tag } from "@composables/useTags";
import {
  IFlogSourceType,
  useFlogSource,
  type IFlog,
} from "@composables/useFlogSource";
import type { IEntry } from "@/modules/EntryData";
import FlogEntry from "./FlogEntry.vue";

const { flogEntriesMap } = defineProps<{
  flogEntriesMap: Tag["flogs"];
}>();

const { availableFlogs, loadFlogEntriesFromSource } = useFlogSource(
  IFlogSourceType.dropbox
);

const loadedFlogs = ref<IFlog[]>([]);

watch(
  availableFlogs,
  () => {
    flogEntriesMap.forEach(([flogFile]) => {
      const flog = availableFlogs.value.reduce<IFlog | undefined>(
        (acc, current) => (current.url == flogFile ? current : acc),
        undefined
      );
      if (flog) {
        loadedFlogs.value.push(flog);
        if (flog.loadedEntries.length == 0) loadFlogEntriesFromSource(flog);
      }
    });
  },
  { immediate: true, deep: true }
);

const matchedFlogEntries = ref<[IFlog, IEntry[]][]>([]);

watch(
  loadedFlogs,
  () => {
    const map = new Map(matchedFlogEntries.value);
    loadedFlogs.value.forEach((flog) => {
      const matchingEntries = flog.loadedEntries.filter((loadedEntry) => {
        const entriesMap = flogEntriesMap
          .filter(([tagFlogFile]) => tagFlogFile == flog.url)
          .map(([, tagEntryDates]) => tagEntryDates)
          .flat()
          .filter((tagEntryDate) => {
            return (
              new Date(tagEntryDate).toDateString() == loadedEntry.date.toDateString()
            );
          });
        return entriesMap.length > 0;
      });
      map.set(flog, matchingEntries);
    });
    matchedFlogEntries.value = [...map];
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.tag-list {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
</style>
