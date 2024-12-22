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
        <button class="modal-default-button" @click="showModal = false">cancel</button>
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
    <p>
      Welcome to Flogger!<br/>
      A project by <a href="https://alvarsirlin.com" target="_blank">Alvar</a> and <a href="https://chad.crume.org/" target="_blank">Chad</a>.<br/>
      See the <a href='https://github.com/alvarix/FLogger/' target='_blank'>Github</a> page for more info.
    </p>
    <p>
      Connect to your DropBox account to begin.
    </p>

      <button class="dbx__btn" @click="launchConnectFlow">connect to DropBox</button>
    </div>

    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
      <button  class="dbx__btn" @click="clearConnection">Disconnect</button>
      <AddFlog @newFlog="handleAddFlog" @openFlog="selectFile" :availableFlogs="availableFlogs"/>
    </div>

    <div id="files-section">
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

<style scoped lang="stylus">
.dbx__btn 
  padding 15px 20px
  font-size 14px
  margin-top 30px
  cursor pointer

.connected .dbx__btn 
  padding 5px 8px
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
}
</style>
