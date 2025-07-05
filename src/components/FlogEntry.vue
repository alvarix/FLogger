<template>
  <div class="entry">
    <h3>{{ formattedDate }}</h3>

    <div
      v-if="!props.isEditing"
      class="entry__body"
      @click="handleStartEditing"
    >
      <MarkedText
        :raw-text="entryText"
        :tags="entryTags"
        :id-suffix="`${entry.date.getTime()}`"
        @tag-selected="handleTagSelect"
      />
    </div>

    <!-- Display a contenteditable textarea if editing -->
    <pre
      v-else
      id="editEntry"
      :ref="bindEntryEl"
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
// Vue 3 Composition API imports
import {
  ref,
  computed,
  nextTick,
  watch,
  type ComponentPublicInstance,
} from "vue";
// Custom composables and types for flog functionality
import {
  useKeyDownHandler,
  useFlog,
  IFlogSourceType,
  type IFlog,
  type IEntry,
  type Tag,
} from "@/composables/useFlog.ts";
// Utility function for cursor positioning
import { placeCursorAtEnd } from "@/modules/utilities";
// Component for rendering marked text with tags
import MarkedText from "@/components/MarkedText.vue";

// Default flog object used as fallback when no flog is provided
const defaultPlaceholderFlog: IFlog = {
  sourceType: IFlogSourceType.localFile,
  url: "unknown",
  loadedEntries: [],
  readOnly: true,
};

// Component props definition
const props = defineProps<{
  flog: IFlog;           // The flog containing this entry
  entry: IEntry;         // The entry data to display/edit
  isEditing?: boolean;   // Whether the entry is currently being edited
  readOnly?: boolean;    // Whether the entry is read-only
}>();

// Event emitters for parent component communication
const emit = defineEmits([
  "update-entry",    // Emitted when entry text is updated
  "start-editing",   // Emitted when editing begins
  "stop-editing",    // Emitted when editing ends
  "tag-selected",    // Emitted when a tag is clicked
]);

// Reactive reference to the flog, with fallback to default
const flogRef = ref<IFlog>(props.flog || defaultPlaceholderFlog);

// Keyboard handler for Shift+Enter to save and blur
const { handleKeyDown } = useKeyDownHandler(handleBlur);

// Flog composable providing tag functionality
const { getTagsForEntryDate, flogTagMap } = useFlog(flogRef);

// Reactive array of tags for this entry's date
const entryTags = ref<Tag["tag"][]>(
  (props.flog && getTagsForEntryDate(props.entry.date)) || []
);

// Watch for changes in the flog's tag map and update entry tags accordingly
watch(
  () => flogTagMap,
  () => {
    entryTags.value =
      (props.flog && getTagsForEntryDate(props.entry.date)) || [];
  }
);

/**
 * Formats a timestamp to MM/DD/YYYY HH:MM:SS format
 * @param timestamp - The timestamp to format (string, number, or Date)
 * @returns Formatted date string
 */
function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US");
  return `${month}/${day}/${year} ${time}`;
}

// Computed property that formats the entry's date for display
const formattedDate = computed(() => formatDate(props.entry.date));

// Local reactive refs to handle prop updates after initial component load
const entryText = ref<string>(props.entry.entry);        // Current entry text content
const isReadOnly = ref<boolean | null>(props.readOnly);  // Read-only state
const entryEl = ref<HTMLElement | null>(null);           // Reference to the editable element

/**
 * Binds the contenteditable element reference
 * @param el - The element to bind (can be HTMLElement or Vue component instance)
 */
const bindEntryEl = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) {
    console.log(`bindEntryEl el`, el);
    entryEl.value = el;
    // if (el) el.focus();
  }
};

/**
 * Handles the start of editing mode
 * Emits start-editing event with the current entry
 */
const handleStartEditing = () => {
  emit("start-editing", props.entry); // Or { ...props.entry, entry: entryText.value } ??
};

/**
 * Sets up the editing environment when entering edit mode
 * Positions cursor at end, scrolls into view, and focuses the element
 */
function setupEditing() {
  nextTick(() => {
    if (entryEl.value && entryEl.value != null) {
      // Set cursor position to the end of the text
      placeCursorAtEnd(entryEl.value);
      // Smooth scroll to the form
      entryEl.value.scrollIntoView({ behavior: "smooth" });
      entryEl.value.focus();
    }
  });
}

/**
 * Handles the blur event when editing ends
 * Extracts text from contenteditable element and emits update events
 */
function handleBlur() {
  // Could use either of these:
  // entryText.value = event.target.innerText;
  entryText.value =
    entryEl.value != null
      ? entryEl.value.innerText
        ? entryEl.value.innerText
        : // @ts-expect-error - yo
          entryEl.value.entry
      : "";
  // Pass back same entry prop with new entry text overwritten
  emit("update-entry", { ...props.entry, entry: entryText.value });
  // // This doesn't work right now because Entry doesn't have its own index to pass back.
  // emit("stop-editing", index);
  emit("stop-editing");
  // // This is not necessary and triggers a re-render on focus
}

/**
 * Handles tag selection events from the MarkedText component
 * @param tag - The selected tag
 */
const handleTagSelect = (tag: Tag["tag"]) => {
  emit("tag-selected", tag);
};

// Watchers for reactive prop updates

// Watch for changes to the entry prop and update local entryText
watch(
  () => props.entry,
  (newValue) => {
    entryText.value = newValue.entry;
  }
);

// Watch for changes to isEditing prop and setup editing when true
watch(
  () => props.isEditing,
  (newValue) => {
    if (newValue) setupEditing();
  },
  { immediate: true }
);

// Watch for changes to readOnly prop and update local isReadOnly state
watch(
  () => props.readOnly,
  (newValue) => {
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
