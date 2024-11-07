<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { IEntry } from '../modules/EntryData'

const props = defineProps<{
  entry: IEntry;
  isEditing: boolean;
  index: number;
}>();


// Emits an event to the parent
const emit = defineEmits([
  'update-entry',
  'stop-editing'
]);

// Utility function to format timestamp to MM/DD/YYYY
function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Computed property to format the entry date
const formattedDate = computed(() => formatDate(props.entry.date));

let isEditingClick = ref(false);
const entryTextarea = ref(null);

function edit(entry) {
  isEditingClick.value = true;
  // textarea isnt in dom yet, so next click needed
  nextTick(() => {
    if (entryTextarea.value) {
      entryTextarea.value.focus();
      // Set cursor position to the start of the text
      entryTextarea.value.selectionStart = 0;
      entryTextarea.value.selectionEnd = 0;
    }
  });
}

// Function to emit the update when blur occurs
function save(entry) {
  emit('update-entry', entry);
  emit('stop-editing', props.index);
  isEditingClick.value = false;
}

</script>




<template>
  <div class="entry">
      <h3>{{ formattedDate }}</h3>

      <div v-if="!isEditing && !isEditingClick" @click="edit" class="entry__body"><pre class="entry__pre">{{ entry.entry }}</pre></div> 
      <!-- Display a textarea if editing -->
      <textarea ref="entryTextarea" class='entry__textarea' v-else @blur="save" v-model="entry.entry"></textarea>
    </div>
</template>

<style scoped>
h3 {
  font-weight: 700;
  font-size: 14px;
}


.entry {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid black;
}

.entry__pre {
  white-space: pre-wrap;
  font-size: 12px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}

.entry__textarea {
  width: 100%;
  height: auto;
  background-color: cornsilk;
  field-sizing: content;
}

.entry__body {
  padding: 20px 0px;
}

.entry__body:hover {
  background-color: cornsilk;
}

@media (prefers-color-scheme: dark) {
  .entry__textarea {
    background-color: #999;
  }
}



</style>
