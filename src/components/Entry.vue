<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { IEntry } from '../modules/EntryData'

const props = defineProps<{
  entry: IEntry;
  isEditing: boolean;
  readOnly?: boolean;
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
      entryTextarea.value.focus({ preventScroll: true });
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
      <textarea ref="entryTextarea" class='entry__textarea' v-else @blur="save" v-model="entry.entry" :readOnly="readOnly"></textarea>
    </div>
</template>

<style scoped lang="stylus">
h3 {
  font-weight: 700;
  font-size: 14px;
  margin: 40px 0 0 20px;
}


.entry__body {
  background-color: var(--misc-color);
}

.entry__pre
  white-space: pre-wrap;

.entry__body, 
.entry textarea,
.entry input {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  font-size: 12px;
  height: auto;
  field-sizing: content;
  padding: 10px 20px ;
  
}

.entry__textarea {
  background-color: var(--input-color);
}

.entry__body:hover {
  background-color: var(--input-color);
}





</style>
