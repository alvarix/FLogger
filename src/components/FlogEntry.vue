<template>
  <div class="entry">
    <h3>{{ formattedDate }}</h3>

    <!-- If not editing, display rendered markdown with VueShowdown -->
    <div
      v-if="!props.isEditing"
      class="entry__body"
      @click="handleStartEditing"
    >
      <VueShowdown flavor="github" :markdown="entryText" />
    </div>

    <!-- Display a contenteditable textarea if editing -->
    <pre
      v-else
      id="editEntry"
      ref="entryEl"
      class="entry__body"
      :contenteditable="!isReadOnly"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      >{{ entryText }}</pre
    >
    <!-- 
      @input="changeEntryText"
      This will be necessary to enable contenteditable wysiwyg features, 
      to convert resulting html to md. 
      Right now you can use command/ctrl-B to bold a word while editing, 
      but that formatting is lost when saved from innerText.
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import type { IEntry } from "../modules/EntryData";
import { useKeyDownHandler } from "@/composables/useFlog.ts";
import { placeCursorAtEnd } from "@/modules/utilities";

const { handleKeyDown } = useKeyDownHandler(handleBlur);

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
  const time = date.toLocaleTimeString("en-US");
  // {{props.entry.date.toLocaleDateString("en-US")}} {{props.entry.date.toLocaleTimeString("en-US")}}
  return `${month}/${day}/${year} ${time}`;
}

// Computed property to format the entry date
const formattedDate = computed(() => formatDate(props.entry.date));

// In order to react to props that update after initial component load,
// we need to make local reactive refs and watch the props
const entryText = ref<string>(props.entry.entry);
const isReadOnly = ref<boolean | null>(props.readOnly);
const entryEl = ref<HTMLElement | null>(null);

const handleStartEditing = () => {
  emit("start-editing", props.entry); // Or { ...props.entry, entry: entryText.value } ??
};

function setupEditing() {
  nextTick(() => {
    console.log("entryEl", entryEl.value);
    if (entryEl.value && entryEl.value != null) {
      // Set cursor position to the end of the text
      placeCursorAtEnd(entryEl.value);
      // Smooth scroll to the form
      entryEl.value.scrollIntoView({ behavior: "smooth" });
      entryEl.value.focus();
    }
  });
}

// Function to emit the update when blur occurs
function handleBlur() {
  // console.log("handleBlur triggered", event.srcElement.value, entryText.value);
  // Could use either of these:
  // entryText.value = event.target.innerText;
  entryText.value = entryEl.value != null ? entryEl.value.innerText : "";
  // Pass back same entry prop with new entry text overwritten
  emit("update-entry", { ...props.entry, entry: entryText.value });
  // // This doesn't work right now because Entry doesn't have its own index to pass back.
  // emit("stop-editing", props.index);
  emit("stop-editing");
  // // This is not necessary and triggers a re-render on focus
}

// what do these watches do?

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
    if (newValue) setupEditing();
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

pre.entry__body
  white-space: pre-wrap; /* Enables wrapping of text, preserving spaces and line breaks */
  word-wrap: break-word; /* Breaks long words to prevent overflow */


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
