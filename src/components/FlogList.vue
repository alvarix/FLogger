<template>
  <section>
  <aside class="vue-file">FlogList.vue</aside>
    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
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

<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import AddFlog from "@/components/AddFlog.vue";
import { ref, watch } from "vue";

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
