<template>
  <aside class="vue-file">FlogTags.vue</aside>

  <h2>Tags</h2>
  <p>Select a tag to filter flog entries containing that tag.</p>
  <ul>
    <li v-for="[tag] in flogTagMap" :key="tag">
      <button
        :class="{ selected: selectedTag == tag }"
        @click="() => handleTagSelect(tag)"
      >
        {{ tag }}
      </button>
      <!-- <ul v-if="selectedTag == tag">
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
      </ul> -->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import type { TagFlogFile, Tag, TagMap } from "@/composables/useTags";

const { flogFile, flogTagMap } = defineProps<{
  flogFile: TagFlogFile;
  flogTagMap: TagMap;
}>();

const emit = defineEmits(["tagSelected"]);

const selectedTag = ref<Tag["tag"]>();

const handleTagSelect = (tag: Tag["tag"]) => {
  selectedTag.value = selectedTag.value != tag ? tag : undefined;
  emit("tagSelected", selectedTag.value);
};
</script>

<style scoped>
.tag-list {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
button.selected {
  border: 2px solid light-dark(orange,deepskyblue);
  text-shadow: 0px 0px 1px light-dark(orange,deepskyblue), 0px 0px 1px light-dark(orange,deepskyblue);
}
</style>
