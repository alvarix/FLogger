<template>
  <aside class="vue-file">EditFlog.vue</aside>

  <div :id="getIdString(flog.url)" class="flex gap-8">
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
          :flog="flog"
          :entries="filteredEntries"
          :editing-entry="isEditingFlogEntries.get(flog)"
          :read-only="flog.readOnly"
          @edit-entry="editEntry"
          @copy-entry="handleCopyEntry"
          @delete-entry="(entry) => handleDeleteEntry(flog, entry)"
          @update-entry="(entry) => handleUpdateEntry(flog, entry)"
          @start-editing="(entry) => handleStartEditingEntry(flog, entry)"
          @stop-editing="() => handleStopEditingEntry(flog)"
          @mounted="mountedCheck"
          @tag-selected="handleTagSelect"
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
        <TagMapSelector
          :flog-tag-map="flogTagMap || []"
          :selected-tag="selectedTag"
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
        <ul v-if="mounted" class="toc-list">
          <li>
            <a :href="'#' + getIdString(flog.url)">Back to Top</a>
          </li>
          <li
            v-for="entryHeading in entryHeadings"
            :key="`toc-${entryHeading.id}`"
          >
            <a
              :href="`#${entryHeading.id}`"
              v-html="renderTextWithTagsMarkedup(entryHeading.heading, tags)"
            ></a>
          </li>
        </ul>
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
      <TagFlogsEntries
        :key="selectedTag"
        :flog-entries-map="externalFlogTagMap || []"
        @tag-selected="handleTagSelect"
        @open-flog="handleOpenFlog"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
// Vue 3 Composition API imports
import { onMounted, ref, unref, watch } from "vue";

// Custom composables for flog management
import { useOpenFlogs } from "@/composables/useOpenFlogs";
import {
  useFlogSource,
  IFlogSourceType,
  type Tag,
} from "@/composables/useFlogSource";
import {
  useFlog,
  IFlogStatus,
  type IFlog,
  EntryData,
  type IEntry,
} from "@/composables/useFlog";

// Vue component imports
import AddEntry from "@components/AddEntry.vue";
import EntryList from "@components/EntryList.vue";
import FlogPretext from "@components/FlogPretext.vue";
// @ts-expect-error - vue-spinner typing issue
import PacmanLoader from "vue-spinner/src/PacmanLoader.vue";
import TagMapSelector from "@components/TagMapSelector.vue";
import TagFlogsEntries from "@components/TagFlogsEntries.vue";

// Utility functions for text processing and DOM manipulation
import {
  getIdString,
  parseHeadingsFromMarkdownString,
  renderTextWithTagsMarkedup,
} from "@/modules/utilities";

// Component props definition
const props = defineProps<{
  flog: IFlog; // Accept the flog as a prop
}>();

// Initialize flog management composables
const { closeFlog, openFlog } = useOpenFlogs();

const {
  saveFlogToSource,
  tagHasFlogEntryDate,
  getFlogMapFromTags,
  loadFlogEntriesFromSource,
} = useFlogSource(IFlogSourceType.dropbox);

const { flogTagMap, addEntry, updatePretext, deleteEntry, editEntry } = useFlog(
  props.flog
);

// Reactive state for entry management
const addEntryValue = ref<IEntry | undefined>(); // Initialize reactive addEntryValue
const isEditingFlogEntries = ref(new Map<IFlog, IEntry>()); // Keep a map of [flog, index] pairs to look up index of entry being edit PER flog

/**
 * Creates and adds a new entry to the flog
 * @param entryData - The entry data to add
 * @param flog - The flog to add the entry to
 */
function addNewEntry(entryData: IEntry, flog: IFlog) {
  const newEntry = new EntryData(new Date(entryData.date), entryData.entry);
  addEntry(newEntry);
  saveFlogToSource(flog);
  isEditingFlogEntries.value.set(flog, newEntry);
  addEntryValue.value = undefined;
  // alert("New entry added");
}

/**
 * Starts editing mode for a specific entry
 * @param flog - The flog containing the entry
 * @param entry - The entry to start editing
 */
const handleStartEditingEntry = (flog: IFlog, entry: IEntry) => {
  isEditingFlogEntries.value.set(flog, entry);
};

/**
 * Stops editing mode for a specific flog
 * @param flog - The flog to stop editing
 */
const handleStopEditingEntry = (flog: IFlog) => {
  isEditingFlogEntries.value.delete(flog);
};

/**
 * Copies an entry to the add entry form
 * @param entry - The entry to copy
 */
const handleCopyEntry = (entry: IEntry) => {
  addEntryValue.value = entry;
  alert("Your entry was copied into the editor");
};

/**
 * Handles entry deletion with user confirmation
 * @param flog - The flog containing the entry
 * @param entry - The entry to delete
 */
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

/**
 * Handles entry updates from child components
 * @param flog - The flog containing the entry
 * @param updatedEntry - The updated entry data
 */
const handleUpdateEntry = (flog: IFlog, updatedEntry: IEntry) => {
  if (flog) {
    editEntry(updatedEntry);
    isEditingFlogEntries.value.delete(flog);
  } else {
    console.error("flog is not defined or initialized");
  }
};

// Loader component properties
const loaderProps = {
  size: undefined,
  color: undefined,
};

/**
 * Handles pretext updates from child components
 * @param flog - The flog to update
 * @param updatedPretext - The new pretext content
 */
function handleUpdatePretext(flog: IFlog, updatedPretext: string) {
  if (flog && !flog.readOnly) {
    updatePretext(updatedPretext);
    saveFlogToSource(flog);
  }
}

// Sidebar tab management
type SidebarTab = "TOC" | "Tags" | "About";
const currentTab = ref<SidebarTab>("TOC");
const sidebarTabs = ref<SidebarTab[]>(["TOC", "Tags", "About"]);

// Entry filtering state
const filteredEntries = ref<IEntry[]>(props.flog.loadedEntries);
const selectedTag = ref<Tag["tag"]>();

// Watch for changes in entries and selected tag to update filtered entries
watch(
  [() => props.flog.loadedEntries, selectedTag],
  () => {
    const tag = selectedTag.value;
    if (tag) {
      filteredEntries.value = props.flog.loadedEntries.filter((entry) => {
        return tagHasFlogEntryDate(tag, props.flog.url, entry.date);
      });
    } else {
      filteredEntries.value = props.flog.loadedEntries;
    }
  },
  { immediate: true }
);

/**
 * Handles tag selection and filters entries accordingly
 * @param tag - The selected tag
 */
const handleTagSelect = (tag: Tag["tag"]) => {
  selectedTag.value = tag;
  if (!tag) {
    filteredEntries.value = props.flog.loadedEntries;
  } else {
    filteredEntries.value = props.flog.loadedEntries.filter((entry) => {
      return tagHasFlogEntryDate(tag, props.flog.url, entry.date);
    });
  }
};

/**
 * Handles opening a different flog and closing the current one
 * @param flog - The flog to open
 */
const handleOpenFlog = (flog: IFlog) => {
  loadFlogEntriesFromSource(flog);
  openFlog(flog);
  closeFlog(props.flog);
};

// Tag management state
const tags = ref<string[]>([]);
watch(
  () => flogTagMap,
  () => {
    tags.value = flogTagMap?.value.map(([tag]) => tag) || [];
  },
  { immediate: true, deep: true }
);

// External flog tag mapping for cross-flog tag navigation
const externalFlogTagMap = ref<Tag["flogs"] | undefined>();
watch(
  selectedTag,
  (newValue) => {
    // Values for selectedTag and/or flogTagMap could have been updated.
    // Get the values to use for filtering down to externalFlogTagMap,
    // which should have entries for the selected tag, excluding this
    // EditFlog component's flog.
    const useSelectedTag = newValue || selectedTag.value;
    if (!useSelectedTag) externalFlogTagMap.value = [];
    else
      externalFlogTagMap.value = getFlogMapFromTags(
        useSelectedTag,
        props.flog.url
      );
  },
  { immediate: true, deep: true }
);

// Table of Contents (TOC) management
type EntryHeading = {
  heading: string;
  id: string;
};
const entryHeadings = ref<EntryHeading[]>([]);

/**
 * Extracts heading information from flog entries for TOC generation
 * @param entries - Array of flog entries
 * @returns Array of heading objects with text and IDs
 */
const getFlogEntryHeadingIds = (entries: IEntry[]): EntryHeading[] => {
  const headingIds: EntryHeading[] = [];
  entries.forEach((entry) => {
    const headings: string[] = parseHeadingsFromMarkdownString(entry.entry);
    headings.forEach((heading) =>
      headingIds.push({
        heading: heading,
        id: getIdString(`${heading} ${entry.date.getTime()}`),
      })
    );
  });
  return headingIds;
};

// Watch for changes in flog entries to update TOC
watch(
  () => props.flog.loadedEntries,
  () => {
    entryHeadings.value = getFlogEntryHeadingIds(props.flog.loadedEntries);
  },
  { immediate: true, deep: true }
);

/*
 * The following method of adding the TOC directly to the DOM
 * no longer works due to the way the MarkedText component injects
 * string HTML into a vue element using v-html.
 * Somehow the HTML in these strings is not being seen by the
 * DOM methods like querySelectorAll and getElementsByClassName
 *
 * Also, it would be better to use the vue DOM rather than rely on
 * knowledge of the entire page DOM, like h1.logo, etc. Another
 * problem arised when implementing the rendered entries from other
 * flogs when a tag is selected. The code below would take all h1's
 * from all rendered entries, and present them as one TOC.
 */

// // Function to handle the TOC in right column

const mounted = ref<boolean>(false);
const mountedCheck = () => {
  mounted.value = true;
};
// watch(mounted, (newValue) => {
//   if (newValue) {
//     const toc = document.querySelector(".toc");
//     if (!toc) return;

//     // Look for added h1 nodes
//     const headers = document.querySelectorAll("h1.md-focus");
//     if (headers.length > 0) {
//       const list = document.createElement("ul");
//       list.className = "toc-list";

//       // Add a "Back to Top" link as the first item
//       const backToTopItem = document.createElement("li");
//       const backToTopAnchor = document.createElement("a");
//       backToTopAnchor.href = "#logo";
//       backToTopAnchor.textContent = "Back to Top";
//       backToTopItem.appendChild(backToTopAnchor);
//       list.appendChild(backToTopItem);

//       headers.forEach((header, index) => {
//         if (header.id === "logo") return;
//         if (!header.id) {
//           header.id = `heading-${index}`;
//         }
//         const listItem = document.createElement("li");
//         const anchor = document.createElement("a");
//         anchor.href = `#${header.id}`;
//         anchor.textContent = header.textContent || `Heading ${index + 1}`;
//         listItem.appendChild(anchor);
//         list.appendChild(listItem);
//       });
//       toc.appendChild(list);
//     }
//   }
// });
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
  padding: 7px 0;
  list-style: none;
  /* margin-left: 20px; */
}

.bullet {
  list-style-type: none;
  list-style-position: outside;
  margin-left: 20px;
}

</style>
<style>

.toc-list button.md-tag {
  display: inline-block;
  padding: 0;
  margin: 0;
  background: rgba(30, 52, 142, 0.5);
  border-radius: 0;
  border: 0;
  border-bottom: 1px solid blue;
}

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
  text-shadow: 0px 0px 1px light-dark(black, white),
    0px 0px 1px light-dark(black, white);
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
