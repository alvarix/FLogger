<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useFlogs } from "@/composables/useFlogs";
import AddFlog from "@/components/AddFlog.vue";
import { useDropboxFiles } from "@/composables/useDropboxFiles";
// const { accountInfo } = useDropboxFiles();
import { ref, watch } from "vue";
import Modal from "@/components/Modal.vue";

const {
  launchConnectFlow,
  connectionPopupWindow,
  hasConnection,
  clearConnection,
  availableFlogs,
  loadFlogEntries,
  addFlog,
} = useDropboxFlogs();

const showModal = ref(false);
watch(connectionPopupWindow, () => {
  showModal.value = connectionPopupWindow ? true : false;
});

const { openFlog } = useFlogs();
// const props = defineProps({});

const selectFile = (file) => {
  console.log("selectFile", file);
  loadFlogEntries(file);
  openFlog(file);
};

function handleAddFlog(flogData) {
  console.log("Not implemented yet", flogData.value.filename);
  addFlog({
    url: flogData.value.filename + ".flogger.txt",
    loadedEntries: [],
  });
}
</script>

<template>
  <button id="show-modal" @click="showModal = true">Show Modal</button>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <modal :show="showModal" @close="showModal = false">
      <template #header>
        <h3>Dropbox authorization in progress</h3>
      </template>
      <template #body>
        <p>
          Complete the Dropbox authorization in the
          <a @click="connectionPopupWindow?.focus()">pop-up window</a>.
        </p>
      </template>
      <template #footer
        ><p></p>
        <button class="modal-default-button" @click="showModal = false">cancel</button>
      </template>
    </modal>
  </Teleport>
  <!-- Example description and UI -->
  <section class="container main">
    <h3>Dropbox Flogs</h3>
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
      <AddFlog
        @newFlog="handleAddFlog"
        @openFlog="selectFile"
        :availableFlogs="availableFlogs"
      />
    </div>

    <div id="files-section">
      <!-- :style="{ display: !loadedFile ? 'block' : 'none' }" -->
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
