<template>
  <aside class="vue-file">TagMapSelector.vue</aside>

  <h2>Tags</h2>
  <p>Select a tag to filter flog entries containing that tag.</p>
  <ul>
    <li v-for="[tag] in props.flogTagMap" :key="tag">
      <button
        :class="{ selected: currentSelectedTag == tag }"
        @click="() => handleTagSelect(tag)"
      >
        {{ tag }}
      </button>
      <!-- <ul v-if="currentSelectedTag == tag">
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
import { ref, defineEmits, watch } from "vue";
import type { Tag, TagMap } from "@/composables/useTags";

const props = defineProps<{
  flogTagMap: TagMap;
  selectedTag?: Tag["tag"];
}>();

const emit = defineEmits(["tagSelected"]);

const currentSelectedTag = ref<Tag["tag"] | undefined>(props.selectedTag);
watch(
  () => props.selectedTag,
  () => {
    currentSelectedTag.value = props.selectedTag;
    console.log("WATCH selectedTag")
  },
  { immediate: true }
);

const handleTagSelect = (tag: Tag["tag"]) => {
  currentSelectedTag.value = currentSelectedTag.value != tag ? tag : undefined;
  emit("tagSelected", currentSelectedTag.value);
};
</script>

<style scoped>
.tag-list {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
button.selected {
  border: 2px solid light-dark(orange, deepskyblue);
  text-shadow: 0px 0px 1px light-dark(orange, deepskyblue),
    0px 0px 1px light-dark(orange, deepskyblue);
}
</style>
