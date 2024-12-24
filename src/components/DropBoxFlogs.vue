<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useDropboxFiles } from "@/composables/useDropboxFiles";
import { useFlogs } from "@/composables/useFlogs";
import AddFlog from "@/components/AddFlog.vue";
// const { accountInfo } = useDropboxFiles();
import { ref, watch } from "vue";
import Modal from "@/components/Modal.vue";

const { accountOwner } = useDropboxFiles();

const {
  launchConnectFlow,
  connectionPopupWindow,
  hasConnection,
  clearConnection,
  availableFlogs,
  availableRepoFlogs,
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
  <!-- <button id="show-modal" @click="showModal = true">Show Modal</button> -->
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <Modal :show="showModal" @close="showModal = false">
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
        <button class="modal-default-button" @click="showModal = false">
          cancel
        </button>
      </template>
    </Modal>
  </Teleport>
  <!-- Example description and UI -->
  <section class="container main">
    <!-- 
    dev note:
    Should this intro text live elsewhere?
    -->
    <div
      id="pre-auth-section"
      :style="{ display: hasConnection ? 'none' : 'block' }"
    >
      <Intro />
  
    </div>

    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
      <button class="dbx__btn small" @click="clearConnection">
        Disconnect {{ accountOwner }}
      </button>
      <AddFlog
        @newFlog="handleAddFlog"
        @openFlog="selectFile"
        :availableFlogs="availableFlogs"
      />
      <div id="files-section">
        <h3>Flogs</h3>
        <ul id="files">
          <li v-for="item in availableFlogs">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              item.path_display ?? item.url
            }}</a>
          </li>
        </ul>
      </div>
      <div id="repo-files-section">
        <h3>Flogger</h3>
        <ul id="files">
          <li v-for="item in availableRepoFlogs">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              item.path_display ?? item.url
            }}</a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped lang="stylus">

.connected .dbx__btn
  position absolute
  top 55px
  right 20px
  margin-top 0

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
  margin-top: 10px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  margin 20px 0 0 20px
}

li {
  margin 5px 0
}
</style>
