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
        :availableFlogs="sortedAvailableFlogs"
      />
      <div id="files-section">
        <h3>Flogs</h3>
        <div>
          <button
            class="incognito-button"
            @click="showSortOptionSelect = !showSortOptionSelect"
            @blur="showSortOptionSelect = false"
          >
            {{ sortOption }}
          </button>
          <button
            class="incognito-button"
            @click="sortDescending = !sortDescending"
          >
            {{ sortDescending ? "↓" : "↑" }}
          </button>
        </div>

        <div class="autoc-select" v-show="showSortOptionSelect">
          <ul id="sortOptions">
            <li v-for="item in sortType">
              <a href="#" @click.prevent="() => selectSortOption(item)">{{
                item
              }}</a>
            </li>
          </ul>
        </div>
        <ul id="files">
          <li v-for="item in sortedAvailableFlogs">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              // @ts-expect-error
              item.path_display ?? item.url
            }}</a>
            <button
              class="small delete-flog"
              @click="() => handleDeleteFlog(item)"
            >
              delete
            </button>
          </li>
        </ul>
      </div>
      <div id="repo-files-section">
        <h3>Flogger</h3>
        <ul id="files">
          <li v-for="item in availableRepoFlogs">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              // @ts-expect-error
              item.path_display ?? item.url
            }}</a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
// @ts-ignore-error
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import AddFlog from "@/components/AddFlog.vue";
import { ref, watch } from "vue";
import { IFlog, IFlogSourceType } from "@/modules/Flog";

const {
  connectionPopupWindow,
  hasConnection,
  availableFlogs,
  availableRepoFlogs,
  loadFlogEntries,
  addFlog,
  deleteFlog,
} = useDropboxFlogs();

const { openFlog } = useOpenFlogs();

const defaultFlogAlreadyOpened = ref(
  !!window.sessionStorage.getItem("defaultFlogAlreadyOpened")
);
const defaultFlogFilepath = "/default.flogger.txt";

const showModal = ref(false);
// @ts-expect-error
watch(connectionPopupWindow, () => {
  showModal.value = connectionPopupWindow ? true : false;
});

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
        window.sessionStorage.setItem(
          "defaultFlogAlreadyOpened",
          // @ts-expect-error
          defaultFlogAlreadyOpened.value
        );
        selectFile(defaultFlogFile);
      }
    }
  },
  { immediate: true }
);

function handleAddFlog(flogData) {
  addFlog({
    url: flogData.value.filename + ".flogger.txt",
    loadedEntries: [],
    rev: null,
    sourceType: IFlogSourceType.dropbox,
  });
}

function handleDeleteFlog(flog: IFlog) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this flog?"
  );
  // If the user confirms deletion, proceed with removing the flog
  if (confirmDelete) {
    deleteFlog(flog);
    console.log("Entry deleted successfully");
  } else {
    console.log("Entry deletion canceled");
  }
}

enum sortType {
  modified = "modified",
  name = "name",
}
const sortOption = ref<sortType>(sortType.modified);
const sortDescending = ref<boolean>(true);

const showSortOptionSelect = ref(false);
function selectSortOption(option: sortType) {
  sortOption.value = option;
}

function sortFlogsByFilename(flogList: IFlog[], descending?: boolean) {
  return flogList.toSorted((a, b) => {
    const nameA = a.url.toLowerCase();
    const nameB = b.url.toLowerCase();

    if (descending) return nameB.localeCompare(nameA);
    else return nameA.localeCompare(nameB);
    // // Case sensative sort:
    // if (a.url < b.url) {
    //   return -1;
    // }
    // if (a.url > b.url) {
    //   return 1;
    // }
    // return 0;
  });
}
function sortFlogsByModified(flogList: IFlog[], descending?: boolean) {
  return flogList.toSorted((a, b) => {
    if (descending) return b.modified.getTime() - a.modified.getTime();
    else return a.modified.getTime() - b.modified.getTime();
  });
}

const sortedAvailableFlogs = ref(
  sortFlogsByModified(availableFlogs.value, true)
);
watch(
  [availableFlogs, sortOption, sortDescending],
  () => {
    switch (sortOption.value) {
      case sortType.name:
        sortedAvailableFlogs.value = sortFlogsByFilename(
          availableFlogs.value,
          sortDescending.value
        );
        break;
      case sortType.modified:
      default:
        sortedAvailableFlogs.value = sortFlogsByModified(
          availableFlogs.value,
          sortDescending.value
        );
    }
  },
  { immediate: true }
);
</script>

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
  margin-top: 10px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  margin: 20px 0 0 20px;
}

li {
  margin: 5px 0;
}

.small {
  margin-left: 1rem;
}

.autoc-select ul {
  list-style: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: var(--input-color);
  margin: 0;
  padding: 0;
  a {
    padding: 10px 15px;
    display: block;
    &:hover {
      background-color: var(--input-color);
    }
  }
}

.incognito-button {
  border-radius: 0;
  background: none;
  font-size: small;
  padding: 0.4rem;
  margin: 0.4rem;
}
</style>
