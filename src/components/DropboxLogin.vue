<template>
  <aside class="vue-file">DropboxLogin.vue</aside>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <ModalContent :show="showModal" @close="showModal = false">
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
    </ModalContent>
  </Teleport>

  <section class="container main">
    <div
      id="pre-auth-section"
      :style="{
        display: hasConnection ? 'none' : 'block',
      }"
    >
      <FloggerIntro />
      <p>Connect to your DropBox account to begin.</p>

      <button class="dbx__btn" @click="launchConnectFlow">
        connect to DropBox
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  IFlogSourceType,
  useFlogSource,
  type IFlog,
} from "@/composables/useFlogSource";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import ModalContent from "@components/ModalContent.vue";
import FloggerIntro from "@components/FloggerIntro.vue";

const {
  launchConnectFlow,
  openPopup,
  hasConnection,
  connectionPopupWindow,
  availableFlogs,
  loadFlogEntriesFromSource,
} = useFlogSource(IFlogSourceType.dropbox);

const { openFlog } = useOpenFlogs();
// const props = defineProps({});

const defaultFlogAlreadyOpened = ref(
  !!window.sessionStorage.getItem("defaultFlogAlreadyOpened")
);
const defaultFlogFilepath = "/default.flogger.txt";

const showModal = ref(false);
watch(
  connectionPopupWindow,
  () => {
    showModal.value = connectionPopupWindow.value ? true : false;
  },
  { immediate: true }
);

const openPop = () => {
  console.log("openPop", openPopup());
  openPopup();
};

const selectFile = (file: IFlog) => {
  console.log("selectFile", file);
  loadFlogEntriesFromSource(file);
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
        window.sessionStorage.setItem(
          "defaultFlogAlreadyOpened",
          'true'
        );
        selectFile(defaultFlogFile);
      }
    }
  },
  { immediate: true }
);
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
