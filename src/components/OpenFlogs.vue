<script setup>
import { useFlogs } from "@/composables/useFlogs";

const { openFlogs, closeFlog } = useFlogs();
// const props = defineProps({});

function addNewEntry(entryData) {
  //console.log(entryData)
  loadEntry(
    new EntryData(
      new Date(entryData.value.date).toLocaleDateString(),
      entryData.value.entry
    )
  );
  dataFileSave({
    entries: openFlogs.value,
  });
}

</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <div>
      <h3>openFlogs</h3>
      {{ JSON.stringify(openFlogs) }}
    </div>
    <div v-for="flog in openFlogs">
      <h2>{{ flog.url }}</h2>
      <button @click.prevent="() => closeFlog(flog)">close flog</button>
      <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" />
      <EntryList :entries="flog.entries" />
    </div>
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
