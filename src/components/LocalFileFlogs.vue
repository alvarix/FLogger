<script setup>
import { useFlogs } from "@/composables/useFlogs";
import { useLocalFileFlogs } from "@/composables/useLocalFileFlogs";

const { openFlog } = useFlogs();
// const props = defineProps({});

const { selectedFileFlog, launchOpenFileFlow, launchRequestPermissionsFlow } =
  useLocalFileFlogs();

async function openLocalFileFlog() {
  await launchOpenFileFlow()
  selectedFileFlog.value && openFlog(selectedFileFlog.value)
}
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <button @click="openLocalFileFlog">open file</button>
    <!-- <div>selectedFileFlog = {{ JSON.stringify(selectedFileFlog) }}</div>
    <div>url = {{ selectedFileFlog?.url }}</div>
    <div>permissions = {{ selectedFileFlog?.permissions }}</div>
    <div>loadedEntries = {{ selectedFileFlog?.loadedEntries }}</div> -->
  </section>
</template>

<style scoped>
#add-entry *:not(.date-validation) {
  display: block;
}

input.error {
  border: 1px solid red;
}

.date-validation.error {
  display: block;
  color: red;
}

#add-entry label {
  margin-top: 20px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  padding: 0.5em;
  margin: 0.5em;
}
</style>
