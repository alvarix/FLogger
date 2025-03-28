<template>
  <div class="entry">
    <h3>{{ formattedDate }}</h3>
    <div v-if="!props.isEditing" @click="handleStartEditing" class="entry__body">
      <VueShowdown flavor="github" :markdown="entryText" />
    </div>

    <!-- Display a textarea if editing -->
    <textarea
      ref="entryTextarea"
      class="entry__textarea auto-resize"
      v-else
      @blur="handleBlur"
      v-model="entryText"
      :readOnly="isReadOnly"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import EntryData, { IEntry } from "../modules/EntryData";

const props = defineProps<{
  entry: IEntry;
  isEditing?: boolean;
  readOnly?: boolean;
}>();

// Emits an event to the parent
const emit = defineEmits(["update-entry", "start-editing", "stop-editing"]);

// Utility function to format timestamp to MM/DD/YYYY
function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Computed property to format the entry date
const formattedDate = computed(() => formatDate(props.entry.date));

// In order to react to props that update after initial component load,
// we need to make local reactive refs and watch the props
const entryText = ref<string>(props.entry.entry);
const isReadOnly = ref<boolean | null>(props.readOnly);
const entryTextarea = ref(null);

const handleStartEditing = () => {
  emit("start-editing", props.entry) // Or { ...props.entry, entry: entryText.value } ??
}

function setupEditing() {
  nextTick(() => {
    if (entryTextarea.value) {
      // Adjust the textarea size after the DOM update
      // entryTextarea.value.style.height = "auto"; // Reset height to shrink if needed
      entryTextarea.value.style.height = `${entryTextarea.scrollHeight}px`; // Set the height based on scrollHeight
      // Set cursor position to the end of the text
      entryTextarea.value.selectionStart = entryTextarea.value.textLength;
      entryTextarea.value.selectionEnd = entryTextarea.value.textLength;
      // Smooth scroll to the form
      entryTextarea.value.scrollIntoView({ behavior: "smooth" });
      // alert("wait for it");
      entryTextarea.value.focus();
    }
  });
}

// Function to emit the update when blur occurs
function handleBlur(thisEntry) {
  // console.log("handleBlur triggered", thisEntry.srcElement.value, entryText.value);
  // Pass back same entry prop with new entry text overwritten
  emit("update-entry", { ...props.entry, entry: entryText.value });
  // // This doesn't work right now because Entry doesn't have its own index to pass back.
  // emit("stop-editing", props.index);
  emit("stop-editing");
  // // This is not necessary and triggers a re-render on focus
}

watch(
  () => props.entry,
  (newValue) => {
    // console.log('watch props.entry')
    entryText.value = newValue.entry;
  }
);

watch(
  () => props.isEditing,
  (newValue) => {
    if (!!newValue) setupEditing();
  },
  { immediate: true }
);

watch(
  () => props.readOnly,
  (newValue) => {
    // console.log('watch props.readOnly')
    isReadOnly.value = newValue;
  }
);

</script>

<style lang="styl">
.entry__body
  ul
    padding-left 20px
    list-style-type disc
</style>

<style lang="styl" scoped>

h3
  font-weight 700
  font-size 14px
  margin 50px 0 20px 20px

.entry__body
  background-color: var(--misc-color)


.entry__pre {
  white-space: pre-wrap;
}
.entry__body,
.entry__textarea {
  font-size: 16px;
  font-family: var(--font);
  width: 100%;
  box-sizing: border-box;
}

.entry__body,
.entry textarea,
.entry input {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  padding: 10px 20px ;
}

.entry__textarea {
  background-color: var(--input-color);
  max-width: 95%;
}

.entry__body:hover {
  background-color: var(--input-color);
}
</style>
