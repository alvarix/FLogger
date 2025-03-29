<template>
  
  <aside class="vue-file">Login.vue</aside>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <Modal :show="showModal" @close="showModal = false">
      <template #header>
        <h3>Dropbox authorization in progress</h3>
      </template>
      <template #body>
        <p>
          Complete the Dropbox authorization
          <a @click="connectionPopupWindow?.focus()">in the pop-up window</a>.
        </p>
        <p>
          If the window doesn't pop-up, <a @click="openPop()">click here</a>.
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

  <section class="container main">
    <div
      id="pre-auth-section"
      :style="{ display: hasConnection ? 'none' : 'block' }"
    >
      <Intro />
    </div>
  </section>
</template>

<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import AddFlog from "@/components/AddFlog.vue";
// const { accountInfo } = useDropboxFiles();
import { ref, watch } from "vue";
import Modal from "@/components/Modal.vue";
import Intro from "@/components/Intro.vue";

const {
  connectionPopupWindow,
  openDbxPopup,
  hasConnection,
  availableFlogs,
  availableRepoFlogs,
  loadFlogEntries,
  addFlog,
} = useDropboxFlogs();

const { openFlog } = useOpenFlogs();
// const props = defineProps({});

const defaultFlogAlreadyOpened = ref(!!window.sessionStorage.getItem("defaultFlogAlreadyOpened"));
const defaultFlogFilepath = "/default.flogger.txt";

const showModal = ref(false);
watch(connectionPopupWindow, () => {
  showModal.value = connectionPopupWindow ? true : false;
});

const openPop = () => {
  console.log("openPop", openDbxPopup);
  openDbxPopup();
};

const selectFile = (file) => {
  console.log("selectFile", file);
  loadFlogEntries(file);
  openFlog(file);
};

watch(
  [hasConnection, availableFlogs],
  () => {
    if (hasConnection.value && !defaultFlogAlreadyOpened.value) {
      const defaultFlogFile = availableFlogs.value.filter(
        (file) => file.url == defaultFlogFilepath
      )[0];
      if (defaultFlogFile) {
        defaultFlogAlreadyOpened.value = true;
        window.sessionStorage.setItem("defaultFlogAlreadyOpened", defaultFlogAlreadyOpened.value);
        selectFile(defaultFlogFile);
      }
    }
  },
  { immediate: true }
);

function handleAddFlog(flogData) {
  console.log("Not implemented yet", flogData.value.filename);
  addFlog({
    url: flogData.value.filename + ".flogger.txt",
    loadedEntries: [],
  });
}
</script>

<style scoped lang="stylus">
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
