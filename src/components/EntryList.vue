<template>
  <h6 class="vue-file">EntryList.vue</h6>
  <ul class="entry-list">
    <li v-for="(entry, index) in entries" :key="entry.entry">
      <Entry
        :key="entry.entry"
        :entry="entry"
        :readOnly="readOnly"
        :isEditing="editingEntry == entry"
        @start-editing="() => handleStartEditingEntry(entry)"
        @stop-editing="() => handleStopEditingEntry(entry)"
        @update-entry="updateEntry"
      />
      <div v-if="editingEntry == entry" class="entry__btns">
        <button class="entry__btn mr-8" @click="">#</button>

        <button class="small entry__btn" @click="changeEntry('update', entry)">
          Save
        </button>
        <button class="small entry__btn" @click="changeEntry('edit', entry)">
          Cancel
        </button>
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
          @click="changeEntry('delete', entry)"
          :disabled="editingEntry == entry"
        >
          Delete
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Entry from "@/components/Entry.vue";
import { IEntry } from "@/modules/EntryData";

const props = defineProps<{
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
]);

function changeEntry(
  actionName: "copy" | "delete" | "edit" | "update",
  entry: IEntry
) {
  // console.log('changeEntry', actionName)
  emit(`${actionName}-entry`, entry);
}

// Function to catch update from child and emit to grandparent
function updateEntry(updatedEntry: IEntry) {
  if (!props.readOnly) {
    // console.log("updateEntry() called");
    // console.log("Forwarding updated entry to grandparent:", updatedEntry);
    emit("update-entry", updatedEntry);
  }
}

// Track the currently editing entry ID
// console.log("props.editingEntry", props.editingEntry);
const editingEntry = ref<IEntry | undefined>(props.editingEntry || null);
watch(
  () => props.editingEntry,
  (newValue) => {
    // console.log("watch props.editingEntry", newValue);
    editingEntry.value = newValue;
  },
  { immediate: true }
);

const editButtonText = ref("Edit");

const handleStartEditingEntry = (entry) => {
  emit("start-editing", entry);
};

// Handle stop-editing event from the child component
const handleStopEditingEntry = (entry) => {
  // console.log(
  //   `handleStopEditingEntry(...)`,
  //   entry,
  //   editingEntry.value,
  //   entry == editingEntry.value,
  //   entry === editingEntry.value
  // );
  emit("stop-editing");
};

// not used
// Toggle function that changes the button text and class
const toggleButton = () => {
  if (editButtonText.value === "Edit") {
    editButtonText.value = "Save";
    //editButtonClass.value = 'button-clicked';
  } else {
    editButtonText.value = "Edit";
    //editButtonClass.value = 'button-normal';
  }
};
</script>

<style scoped>
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
