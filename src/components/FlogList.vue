<template>
  <section>
    <aside class="vue-file">FlogList.vue</aside>
    <div
      id="authed-section"
      :style="{
        display: hasConnection ? 'block' : 'none',
      }"
    >
      <AddFlog
        :available-flogs="sortedAvailableFlogs"
        @new-flog="handleAddFlog"
        @open-flog="selectFile"
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

        <div v-show="showSortOptionSelect" class="autoc-select">
          <ul id="sortOptions">
            <li v-for="item in sortType" :key="item">
              <a href="#" @click.prevent="() => selectSortOption(item)">{{
                item
              }}</a>
            </li>
          </ul>
        </div>
        <ul id="files">
          <li v-for="item in sortedAvailableFlogs" :key="item.url">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              item.url
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
          <li v-for="item in availableRepoFlogs" :key="item.url">
            <a href="#" @click.prevent="() => selectFile(item)">{{
              item.url
            }}</a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource";
import type { IFlog } from "@/composables/useFlogSource";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import AddFlog from "@components/AddFlog.vue";
import { ref, watch } from "vue";

const {
  hasConnection,
  connectionPopupWindow,
  availableFlogs,
  availableRepoFlogs,
  loadFlogEntriesFromSource,
  addFlogToSource,
  deleteFlogFromSource,
} = useFlogSource(IFlogSourceType.dropbox);

const { openFlog } = useOpenFlogs();

const defaultFlogAlreadyOpened = ref(
  !!window.sessionStorage.getItem("defaultFlogAlreadyOpened")
);
const defaultFlogFilepath = "/default.flogger.txt";

const showModal = ref(false);
watch(connectionPopupWindow, () => {
  showModal.value = connectionPopupWindow.value ? true : false;
});

watch(
  [hasConnection, availableFlogs],
  () => {
    if (hasConnection.value && !defaultFlogAlreadyOpened.value) {
      const defaultFlogFile = availableFlogs.value.filter(
        (flog) =>
          flog.sourceType == IFlogSourceType.dropbox &&
          flog.url == defaultFlogFilepath
      )[0];
      if (defaultFlogFile) {
        defaultFlogAlreadyOpened.value = true;
        window.sessionStorage.setItem("defaultFlogAlreadyOpened", "true");
        selectFile(defaultFlogFile);
      }
    }
  },
  { immediate: true }
);

function selectFile(file: IFlog) {
  loadFlogEntriesFromSource(file);
  openFlog(file);
}

function handleAddFlog(flogFilename: string) {
  addFlogToSource({
    url: flogFilename,
    loadedEntries: [],
    sourceType: IFlogSourceType.dropbox,
    // @ts-expect-error - Need to figure out proper handling of rev here. Is it needed to add? 
    rev: null,
  });
}

function handleDeleteFlog(flog: IFlog) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this flog?"
  );
  // If the user confirms deletion, proceed with removing the flog
  if (confirmDelete) {
    deleteFlogFromSource(flog);
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
  return (
    flogList.toSorted((a, b) => {
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
    }) || []
  );
}
function sortFlogsByModified(flogList: IFlog[], descending?: boolean): IFlog[] {
  return (
    flogList.toSorted((a, b) => {
      const aVal = a.modified ? a.modified.getTime() : 0;
      const bVal = b.modified ? b.modified.getTime() : 0;
      if (descending) return bVal - aVal;
      else return aVal - bVal;
    }) || []
  );
}

const sortedAvailableFlogs = ref<IFlog[]>(
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
