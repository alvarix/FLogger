<script setup>
import { useFlogs } from "@/composables/useFlogs";
import AddEntry from "@/components/AddEntry.vue"
import EntryList from "@/components/EntryList.vue"

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
    <h3>Open Flogs</h3>
    <div v-for="flog in openFlogs">
      <AddEntry @newEntry="addNewEntry" :timestamp="timestamp" />
      <h4>{{ flog.url }}</h4>
      <button @click.prevent="() => closeFlog(flog)">close flog</button>
      <EntryList :entries="flog.loadedEntries" />
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
