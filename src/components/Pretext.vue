<template>
  <aside class="vue-file">Pretext.vue</aside>

  <button class="small popbutton" popovertarget="my-popover">Flog Info</button>
  <div id="my-popover" popover class="popover">
    <div class="pretext">
      <button
        class="small popbutton"
        popovertarget="my-popover"
        popovertargetactin="hide"
      >
        close
      </button>

      <!-- Display a pre, contenteditable if editing -->
      <pre
        id="editPretext"
        ref="pretextEl"
        class="pretext__body"
        :contenteditable="isEditing && !readOnly"
        @click="edit"
        @blur="save"
        >{{ pretextValue }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { placeCursorAtEnd } from "@/modules/utilities";

const props = defineProps<{
  pretext?: string;
  readOnly?: boolean;
}>();

// Emits an event to the parent
const emit = defineEmits(["update-pretext"]);

const isEditing = ref(false);
const pretextEl = ref<HTMLElement | null>(null);
const pretextValue = ref<string>(props.pretext || "");
console.log("pretextValue.value", pretextValue.value);

function edit() {
  isEditing.value = true;
}

function setupEditing() {
  nextTick(() => {
    console.log("pretextEl", pretextEl.value);
    if (pretextEl.value && pretextEl.value != null) {
      // Set cursor position to the end of the text
      placeCursorAtEnd(pretextEl.value);
      pretextEl.value.focus();
    }
  });
}

watch(
  () => props.pretext,
  (newValue) => {
    pretextValue.value = newValue || '';
  },
  { immediate: true }
);
watch(
  isEditing,
  (newValue) => {
    if (!!newValue) setupEditing();
  },
  { immediate: true }
);

// Function to emit the update when blur occurs
function save(event:FocusEvent) {
  // console.log('save pretextValue', pretextValue)
  // Could use either of these:
  // entryText.value = event.target.innerText;
  pretextValue.value = pretextEl.value!=null ? pretextEl.value.innerText : '';
  emit("update-pretext", pretextValue.value);
  isEditing.value = false;
}
</script>

<style lang="styl" scoped>

.popbutton {
  margin: 1rem 0rem;
}

.popover
  font-weight: 400;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  max-width: 80ch;
  line-height: 1.4;
  border:0
  top: 2rem;
  margin: 0 auto;
  box-shadow 0 0 6px #999



.pretext__body {
  background-color: var(--misc-color);
}

pre.pretext__body {
  white-space: pre-wrap; /* Enables wrapping of text, preserving spaces and line breaks */
  word-wrap: break-word; /* Breaks long words to prevent overflow */
}

.pretext__body {
  font-size: 16px;
  font-family: var(--font);
  width 100%
  box-sizing border-box
}

.pretext__body,
.pretext input {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  padding: 10px 20px ;
}

.pretext__body:hover {
  background-color: var(--input-color);
}
</style>
