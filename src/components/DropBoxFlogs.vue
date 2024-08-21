<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useFlogs } from "@/composables/useFlogs";

const {
  launchConnectFlow,
  hasConnection,
  clearConnection,
  availableFlogs,
  loadFlogEntries,
} = useDropboxFlogs();

const { openFlogs, openFlog } = useFlogs();
// const props = defineProps({});

const selectFile = (file) => {
  loadFlogEntries(file);
  openFlog(file);
};

</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <p>
      To load files from your DropBox account, you need to connect to DropBox
      and authorize Flogger.
    </p>
    <div
      id="pre-auth-section"
      :style="{ display: hasConnection ? 'none' : 'block' }"
    >
      <button @click="launchConnectFlow">connect to DropBox</button>
    </div>

    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
      <p>You are connected to DropBox.</p>
      <button @click="clearConnection">forget DropBox connection</button>
    </div>

    <div id="files-section">
      <!-- :style="{ display: !loadedFile ? 'block' : 'none' }" -->
      <p>
        Below are the .flogger files available in your of the App/flogger
        folder.
      </p>
      <ul id="files">
        <li v-for="item in availableFlogs">
          <a href="#" @click.prevent="() => selectFile(item)">{{
            item.path_display ?? item.url
          }}</a>
        </li>
      </ul>
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
