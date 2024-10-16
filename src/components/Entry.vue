<script setup lang="ts">
import { ref, computed } from "vue";
import { IEntry } from '../modules/EntryData'

const props = defineProps<{
  entry: IEntry;
  isEditing: boolean;
}>();


// Emits an event to the parent
const emit = defineEmits<{
  (e: 'update-entry', updatedEntry: IEntry): void;
}>();

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

// Function to emit the update when blur occurs
function save() {
  emit('update-entry', props.entry);
  console.log('save() called - emitting event to parent');
  console.log('Updated entry:', props.entry);
}

</script>




<template>
  <div class="entry">
      <h3>{{ formattedDate }}</h3>

      <div v-if="!isEditing"><pre class="entry__pre">{{ entry.entry }}</pre></div> 
      <!-- Display a textarea if editing -->
      <textarea class='entry__textarea' v-else @blur="save" v-model="entry.entry"></textarea>
    </div>
</template>

<style scoped>
h3 {
  font-weight: 700;
  margin-bottom: 20px;
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
}


</style>
