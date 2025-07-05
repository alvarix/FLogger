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
// Vue 3 Composition API imports
import { ref, defineEmits, watch } from "vue";
// Type definitions for tag functionality
import type { Tag, TagMap } from "@/composables/useTags";

// Component props definition with TypeScript validation
const props = defineProps<{
  flogTagMap: TagMap;        // Map of tags to their associated entries
  selectedTag?: Tag["tag"];  // Currently selected tag (optional)
}>();

// Event emitter for tag selection communication with parent component
const emit = defineEmits(["tagSelected"]);

// Reactive reference to track the currently selected tag locally
const currentSelectedTag = ref<Tag["tag"] | undefined>(props.selectedTag);

// Watch for changes to the selectedTag prop and update local state
watch(
  () => props.selectedTag,
  () => {
    currentSelectedTag.value = props.selectedTag;
    console.log("WATCH selectedTag")
  },
  { immediate: true }  // Run immediately on component mount
);

/**
 * Handles tag selection events from the UI
 * Toggles the selected tag - if clicking the same tag, deselects it
 * @param tag - The tag that was clicked
 */
const handleTagSelect = (tag: Tag["tag"]) => {
  // Toggle selection: if tag is already selected, deselect it; otherwise select it
  currentSelectedTag.value = currentSelectedTag.value != tag ? tag : undefined;
  // Emit the selection change to parent component
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
