<template>
  <aside class="vue-file">FlogTags.vue</aside>

  <h2>Tags</h2>
  <ul>
    <li v-for="[tag, flogs] in flogTagMap" :key="tag">
      <button @click="() => (currentTag = tag)">{{ tag }}</button>
      <ul v-if="currentTag == tag">
        <li>
          <i>this flog</i>
          <ul class="tag-list">
            <li
              v-for="[tagFlogFile, entries] in flogs.filter(
                ([filterFlogFile]) => filterFlogFile == flogFile
              )"
              :key="tagFlogFile"
            >
              {{ tagFlogFile }} ({{ entries.length }} entries)
            </li>
          </ul>
        </li>
        <li>
          <i>other flogs</i>
          <ul class="tag-list">
            <li
              v-for="[tagFlogFile, entries] in flogs.filter(
                ([filterFlogFile]) => filterFlogFile != flogFile
              )"
              :key="tagFlogFile"
            >
              {{ tagFlogFile }} ({{ entries.length }} entries)
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  type ITagFlogEntryPointer,
  type ITag,
  type TagMap,
} from "@/composables/useTags";

const { flogFile, flogTagMap } = defineProps<{
  flogFile: ITagFlogEntryPointer["file"];
  flogTagMap: TagMap; // Accept the flog as a prop
}>();

const currentTag = ref<ITag["tag"]>();
</script>

<style scoped>
.tag-list {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
</style>
