<template>
  <aside class="vue-file">TagFlogsEntries.vue</aside>

  <h2>Tagged entries in other flogs</h2>
  <div v-if="flogEntriesMap.length == 0">none</div>
  <div v-else>
    <div
      v-for="[flogFile, entryDates] in flogEntriesMap"
      :key="flogFile"
      class="mb-2"
    >
      <TagFlog :flog-file="flogFile" :entry-dates="entryDates" />
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
import TagFlog from "@components/TagFlog.vue";

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
    // When availableFlogs updates:
    //  - Update loadedFlogs to match
    //  - Load entries from source for each flog in availableFlogs and flogEntriesMap
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
    // When loadedFlogs updates:
    //  - Update matchedFlogEntries
    //    This requires building a map
    //    We loop through loadedFlogs, find matching entries,
    //    and output a map of flogs to matching entries
    const map = new Map(matchedFlogEntries.value);
    loadedFlogs.value.forEach((flog) => {
      // Filter entries for this flog to ones that have a match in flogEntriesMap
      const matchingEntries = flog.loadedEntries.filter((loadedEntry) => {
        // Find if there are any matches in flogEntriesMap
        // for this specific flog entry
        const entriesMap = flogEntriesMap
          .filter(([tagFlogFile]) => tagFlogFile == flog.url)
          .map(([, tagEntryDates]) => tagEntryDates)
          .flat()
          .map((tagEntryDate) => new Date(tagEntryDate))
          .filter((tagEntryDate) => tagEntryDate.getTime() == loadedEntry.date.getTime())
          .flat();
        // Filter out this entry if there are matches in flogEntriesMap
        // (Not likely to be > 1, but possible.)
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
