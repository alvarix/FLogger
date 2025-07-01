<template>
  <aside class="vue-file">EditFlog.vue</aside>

  <div class="flex gap-8">
    <section class="container main">
      <div :class="{ viewport: !selectedTag }">
        <h4 class="flog-title">
          {{ flog.url }}

          <FlogPretext
            :pretext="flog.pretext"
            :read-only="flog.readOnly"
            @update-pretext="
              (updatedPretext) => handleUpdatePretext(flog, updatedPretext)
            "
          />
          <button
            class="small close-flog"
            @click.prevent="() => closeFlog(flog)"
          >
            flog list
          </button>
        </h4>

        <AddEntry
          v-if="!selectedTag"
          :entry-value="addEntryValue"
          @new-entry="(entryData) => addNewEntry(unref(entryData), flog)"
        />
      </div>

      <div id="spinner">
        <PacmanLoader
          :loading="flog.status != IFlogStatus.loaded"
          :color="loaderProps.color"
          :size="loaderProps.size"
        />
      </div>

      <div v-if="flog.status == IFlogStatus.loaded">
        <EntryList
          :entries="filteredEntries"
          :editing-entry="getFlogEditingEntry(flog)"
          :read-only="flog.readOnly"
          @edit-entry="editEntry"
          @copy-entry="handleCopyEntry"
          @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
          @update-entry="(entry) => handleUpdateEntry(flog, entry)"
          @start-editing="(entry) => handleStartEditingEntry(flog, entry)"
          @stop-editing="() => handleStopEditingEntry(flog)"
          @mounted="mountedCheck"
        />
      </div>
    </section>
    <section class="container sidebar viewport">
      <div class="sidebar-tabs">
        <div
          v-for="tab in sidebarTabs"
          :key="tab"
          :data-tab-selected="currentTab == tab"
          class="sidebar-tab"
          @click="
            () => {
              currentTab = tab;
            }
          "
        >
          {{ tab }}
        </div>
      </div>
      <div :data-tab-selected="currentTab == 'Tags'" class="sidebar-panel mb-7">
        <FlogTags
          :flog-tag-map="flogTagMap"
          :flog-file="flog.url"
          @tag-selected="handleTagSelect"
        />
      </div>
      <div
        :data-tab-selected="currentTab == 'TOC'"
        class="toc sidebar-panel mb-7"
      >
        <h2>Contents</h2>
        <PacmanLoader
          :loading="!mounted"
          :color="loaderProps.color"
          :size="loaderProps.size"
        />
      </div>
      <div
        :data-tab-selected="currentTab == 'About'"
        class="sidebar-panel mb-7"
      >
        <h2>About</h2>
        <p>Add a new entry to this flog.</p>
        <p>Scroll to read and edit entries in this flog.</p>
        <p>Write entries using markdown.</p>
        <p>
          Use h1's (a line staring with "# ") to tag your entries. One or more
          tags will automatically be extracted from any h1.
        </p>
        <p>The TOC panel allows you to navigate the h1's.</p>
        <p>
          The Tags panel allows you to navigate the tags in this flog, and other
          flogs with those tags.
        </p>
      </div>
    </section>
    <section v-if="selectedTag" class="container sidebar viewport">
      <TagFlogsEntries :key="selectedTag" :flog-entries-map="externalFlogTagMap"/>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, unref, watch } from "vue";
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import {
  useFlogSource,
  IFlogSourceType,
  type TagMap,
  type Tag,
} from "@/composables/useFlogSource";
import { useFlog, IFlogStatus } from "@/composables/useFlog";
import type { IFlog } from "@/composables/useFlog";
import EntryData from "@/modules/EntryData";
import type { IEntry } from "@/modules/EntryData";
import AddEntry from "@components/AddEntry.vue";
import EntryList from "@components/EntryList.vue";
import FlogPretext from "@components/FlogPretext.vue";
// @ts-expect-error - vue-spinner typing issue
import PacmanLoader from "vue-spinner/src/PacmanLoader.vue";
import FlogTags from "@components/FlogTags.vue";
import TagFlogsEntries from "./TagFlogsEntries.vue";

const props = defineProps<{
  flog: IFlog; // Accept the flog as a prop
}>();

const { closeFlog } = useOpenFlogs();

const { saveFlogToSource, tagIndex, getTagsForFlog, tagHasFlogEntryDate } =
  useFlogSource(IFlogSourceType.dropbox);

const flogTagMap = ref<TagMap>(
  unref(getTagsForFlog(props.flog.url) || []) as TagMap
);
watch(
  [tagIndex, getTagsForFlog],
  () => {
    // console.log("TAGS watch tagIndex", getTagsForFlog(props.flog.url));
    flogTagMap.value = unref(getTagsForFlog(props.flog.url) || []) as TagMap;
  },
  { immediate: true }
);

const filteredEntries = ref<IEntry[]>(props.flog.loadedEntries);

const { addEntry, updatePretext, deleteEntry, editEntry } = useFlog(props.flog);

const addEntryValue = ref<IEntry | undefined>(); // Initialize reactive addEntryValue
const isEditingFlogEntries = ref(new Map<IFlog, IEntry>()); // Keep a map of [flog, index] pairs to look up index of entry being edit PER flog
const getFlogEditingEntry = (flog: IFlog): IEntry | undefined =>
  isEditingFlogEntries.value.get(flog);

function addNewEntry(entryData: IEntry, flog: IFlog) {
  const newEntry = new EntryData(new Date(entryData.date), entryData.entry);
  addEntry(newEntry);
  saveFlogToSource(flog);
  isEditingFlogEntries.value.set(flog, newEntry);
  addEntryValue.value = undefined;
  // alert("New entry added");
}

const handleStartEditingEntry = (flog: IFlog, entry: IEntry) => {
  // console.log('handleStartEditingEntry', entry)
  isEditingFlogEntries.value.set(flog, entry);
};

const handleStopEditingEntry = (flog: IFlog) => {
  // console.log('handleStopEditingEntry')
  isEditingFlogEntries.value.delete(flog);
};

const handleCopyEntry = (entry: IEntry) => {
  addEntryValue.value = entry;
  alert("Your entry was copied into the editor");
};

// Handle entry deletion with confirmation
const handleDeleteEntry = (flog: IFlog, entry: IEntry) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this entry?"
  );

  // If the user confirms deletion, proceed with removing the entry
  if (confirmDelete) {
    deleteEntry(entry); // Delete the entry
    console.log("Entry deleted successfully");
  } else {
    console.log("Entry deletion canceled");
  }
};

// Function to handle the update event from the grandchild and update flog
const handleUpdateEntry = (flog: IFlog, updatedEntry: IEntry) => {
  // console.log("handleUpdateEntry() in grandparent called");
  // console.log("Received updated entry:", updatedEntry);

  if (flog) {
    editEntry(updatedEntry);
    isEditingFlogEntries.value.delete(flog);
    // console.log("deleting", isEditingFlogEntries.value.delete(flog));
    // = new Map([]); // Create a new map with one entry rather than track multiple entries being edited across flogs at the same time
  } else {
    console.error("flog is not defined or initialized");
  }
};

const loaderProps = {
  size: undefined,
  color: undefined,
};

// Function to catch update from child and emit to grandparent
function handleUpdatePretext(flog: IFlog, updatedPretext: string) {
  if (flog && !flog.readOnly) {
    // console.log("handleUpdatePretext() called");
    // console.log("new pretext:", updatedPretext);
    updatePretext(updatedPretext);
    saveFlogToSource(flog);
  }
}

// Sidebar Tabs
type SidebarTab = "TOC" | "Tags" | "About";
const currentTab = ref<SidebarTab>("Tags");
const sidebarTabs = ref<SidebarTab[]>(["TOC", "Tags", "About"]);

const selectedTag = ref<Tag["tag"]>();

const handleTagSelect = (tag: Tag["tag"]) => {
  console.log("TAGS handleTagSelect", tag);
  selectedTag.value = tag;
  if (!tag) {
    filteredEntries.value = props.flog.loadedEntries;
  } else {
    filteredEntries.value = props.flog.loadedEntries.filter((entry) => {
      return tagHasFlogEntryDate(tag, props.flog.url, entry.date);
    });
  }
};

const externalFlogTagMap = ref<Tag["flogs"]>([]);
watch(
  [selectedTag, flogTagMap],
  ([newSelectedTag, newFlogTagMap], [oldSelectedTag]) => {
    if (!newSelectedTag) externalFlogTagMap.value = [];
    else if (oldSelectedTag!=newSelectedTag)
      externalFlogTagMap.value = newFlogTagMap
        .filter(([tag]) => tag == newSelectedTag)
        .map<Tag["flogs"]>(([, flogs]) => flogs)
        .flat()
        .filter(([flogFile]) => flogFile != props.flog.url);
  },
  { immediate: true, deep: true }
);

// Function to handle the TOC in right column

const mounted = ref(false);
const mountedCheck = () => {
  mounted.value = true;
};

watch(mounted, (newValue) => {
  if (newValue) {
    const toc = document.querySelector(".toc");
    if (!toc) return;

    // Look for added h1 nodes
    const headers = document.querySelectorAll("h1");
    if (headers.length > 0) {
      const list = document.createElement("ul");
      list.className = "toc-list";

      // Add a "Back to Top" link as the first item
      const backToTopItem = document.createElement("li");
      const backToTopAnchor = document.createElement("a");
      backToTopAnchor.href = "#logo";
      backToTopAnchor.textContent = "Back to Top";
      backToTopItem.appendChild(backToTopAnchor);
      list.appendChild(backToTopItem);

      headers.forEach((header, index) => {
        if (header.id === "logo") return;
        if (!header.id) {
          header.id = `heading-${index}`;
        }
        const listItem = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.href = `#${header.id}`;
        anchor.textContent = header.textContent || `Heading ${index + 1}`;
        listItem.appendChild(anchor);
        list.appendChild(listItem);
      });
      toc.appendChild(list);
    }
  }
});
</script>

<style scoped>
#spinner {
  text-align: left;
  width: 100%;
  padding: 1rem;
}

h4 {
  box-sizing: border-box;
  margin: 10px 0 10px;
  padding: 0 0 10px 0;
  font-style: italic;
}
.no-margin-bottom {
  margin-bottom: 0px;
}
h5 {
  padding: 0;
}

button.small {
  margin-left: 10px;
}

.toc-list li {
  padding: 5px 0;
  list-style: circle;
  margin-left: 20px;
}

.bullet {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}
</style>
<style>
.sidebar {
  display: none;
  @media (min-width: 990px) {
    display: block;
  }
}

.sidebar-tabs {
  scroll-behavior: smooth;
  position: fixed;
  padding-left: 10px;
}

.sidebar-tab {
  display: inline-block;
  width: fit-content;
  padding: 4px;
  margin-right: 0.5px;
  border: 1px solid #ccc;
  border-radius: 4px 4px 0 0;
  border-bottom: none;
  height: fit-content;
}

.sidebar-tab[data-tab-selected="true"] {
  text-shadow: 0px 0px 1px light-dark(black,white), 0px 0px 1px light-dark(black,white);
}

.sidebar-panel {
  scroll-behavior: smooth;
  position: fixed;
  top: 92px;
  height: calc(100dvh - 140px);
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  max-width: 300px;
  width: 100%;
  overflow: auto;

  h2 {
    margin-top: 0;
  }
}

.sidebar-panel {
  visibility: hidden;
}
.sidebar-panel[data-tab-selected="true"] {
  visibility: visible;
}

.sidebar-panel p {
  padding: 7px 0px;
}
</style>
