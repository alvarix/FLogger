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
    <h3>Local File Flogs</h3>
    <button @click="openLocalFileFlog">Open Flog</button>
    <!-- <div>selectedFileFlog = {{ JSON.stringify(selectedFileFlog) }}</div>
    <div>url = {{ selectedFileFlog?.url }}</div>
    <div>permissions = {{ selectedFileFlog?.permissions }}</div>
    <div>loadedEntries = {{ selectedFileFlog?.loadedEntries }}</div> -->
  </section>
</template>

<style scoped>
button {
	border-radius: 10px;
	padding: 6px 10px;
	margin-top: 10px;
	cursor: pointer;
}

</style>
