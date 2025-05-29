<template>
  <aside class="vue-file">TagFlogsEntries.vue</aside>

  <h2>Tagged entries in other flogs</h2>
  <div v-if="flogEntriesMap.length == 0">none</div>
  <div v-else>
    <div
      v-for="[tagFlogFile, entryDates] in flogEntriesMap"
      :key="tagFlogFile"
      class="mb-2"
    >
      <TagFlog :flog-file="tagFlogFile" :entry-dates="entryDates" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Tag } from "@composables/useTags";
import {
  IFlogSourceType,
  useFlogSource,
  type FlogEntryMap,
} from "@composables/useFlogSource";
import TagFlog from "@components/TagFlog.vue";

const { flogEntriesMap } = defineProps<{
  flogEntriesMap: Tag["flogs"];
}>();

const { availableFlogs, loadAndGetFlogEntryMapFromTagFlogMap } = useFlogSource(
  IFlogSourceType.dropbox
);

const matchedFlogEntries = ref<FlogEntryMap>([]);

watch(
  availableFlogs,
  () => {
    // When availableFlogs updates:
    //  - Update loadedFlogs to match
    //  - Load entries from source for each flog in availableFlogs and flogEntriesMap
    //  - Update matchedFlogEntries for these same flogs and the matching entries in each
    //    This requires building a map
    //    We loop through loadedFlogs, find matching entries,
    //    and output a map of flogs to matching entries

    matchedFlogEntries.value =
      loadAndGetFlogEntryMapFromTagFlogMap(flogEntriesMap);
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
