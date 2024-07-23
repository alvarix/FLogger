<script setup lang="ts">
import { ref, computed } from "vue";
import { IEntry } from '../modules/EntryData'

const props = defineProps<{
  entry: IEntry;
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


</script>




<template>
  <div class="entry">
      <h3>{{ formattedDate }}</h3>

      <div><pre>{{ entry.entry }}</pre></div> 
      
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


</style>
