<template>
  <aside class="vue-file">EntryList.vue</aside>
  <ul class="entry-list">
    <li v-for="entry in entries" :key="entry.entry">
      <FlogEntry
        :key="entry.entry"
        :flog="flog"
        :entry="entry"
        :read-only="readOnly"
        :is-editing="editingEntry == entry"
        @start-editing="() => handleStartEditingEntry(entry)"
        @stop-editing="() => handleStopEditingEntry()"
        @update-entry="updateEntry"
      />
      <div v-if="editingEntry == entry" class="entry__btns">
        <button class="entry__btn mr-8" @click.prevent="">#</button>
        <span class="small"> Shift + Return or Tab to save </span>
      </div>
      <div v-else class="entry__btns">
        <button
          v-if="!readOnly"
          class="small entry__btn"
          @click="handleStartEditingEntry(entry)"
        >
          {{ editButtonText }}
        </button>
        <button class="small entry__btn" @click="changeEntry('copy', entry)">
          Copy
        </button>
        <button
          v-if="!readOnly"
          class="small entry__btn entry__btn--warn"
          :disabled="editingEntry == entry"
          @click="changeEntry('delete', entry)"
        >
          Delete
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineEmits } from "vue";
import FlogEntry from "@components/FlogEntry.vue";
import type { IEntry } from "@modules/EntryData";
import type { IFlog } from "@modules/Flog";

const props = defineProps<{
  flog: IFlog;
  entries?: Array<IEntry>;
  readOnly?: boolean;
  editingEntry?: IEntry;
}>();

const emit = defineEmits([
  "copy-entry",
  "delete-entry",
  "edit-entry",
  "update-entry",
  "start-editing",
  "stop-editing",
  "mounted",
]);

function changeEntry(
  actionName: "copy" | "delete" | "edit" | "update",
  entry: IEntry
) {
  emit(`${actionName}-entry`, entry);
}

// Function to catch update from child and emit to grandparent
function updateEntry(updatedEntry: IEntry) {
  if (!props.readOnly) {
    emit("update-entry", updatedEntry);
  }
}

// Track the currently editing entry ID
const editingEntry = ref<IEntry | undefined>(props.editingEntry);
watch(
  () => props.editingEntry,
  (newValue) => {
    editingEntry.value = newValue;
  },
  { immediate: true }
);

const editButtonText = ref("Edit");

const handleStartEditingEntry = (entry: IEntry) => {
  emit("start-editing", entry);
};

// Handle stop-editing event from the child component
const handleStopEditingEntry = () => {
  emit("stop-editing");
};

onMounted(() => {
  console.log("Child component mounted!");
  emit("mounted"); // Correctly emits the 'mounted' event
});
</script>

<style scoped>
.entry-list {
  scroll-behavior: smooth;
}

.entry-list > li {
  border-radius: 14px;
  list-style: none;
  margin-top: 10px;
}

.entry__btn:hover {
  color: #000;
}

.entry__btn--warn:hover {
  color: red;
}

.entry__btn:disabled,
.entry__btn--warn:hover:disabled {
  color: #888;
}
</style>
