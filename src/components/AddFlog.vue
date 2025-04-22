<template>
  <aside class="vue-file">AddFlog.vue</aside>
  <div v-if="!showInput">
    <button
      @click="
        () => {
          showInput = true;
        }
      "
    >
      add new flog
    </button>
  </div>
  <form
    v-else
    id="add-flog"
    @submit.prevent="submitAdd"
    @mouseleave="hideDropdown"
    @keydown="handleKeydown"
  >
    <div class="filename-controls">
      <input
        id="filename"
        v-model="typedFilename"
        autofocus
        autocomplete="off"
        :class="['filename', { error: hasError }]"
        type="text"
        placeholder="search or create new flog"
        @focus="showDropdown = true"
        @input="showDropdown = true"
      />
      <div v-show="showDropdown" class="autoc-select">
        <ul id="files">
          <li v-for="item in matchedFlogs" :key="item.url">
            <a href="#" @click.prevent="() => selectFlog(item)">{{
              item.url
            }}</a>
          </li>
        </ul>
      </div>
      <em class="date-validation hidden" :class="{ error: hasError }"
        >Please enter valid file name</em
      >
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * A component with a form for creating a new flog, or opening a flog from availableFlogs
 * @component
 */

import { ref, watch } from "vue";
import type { IFlog } from "@/modules/Flog";

const emit = defineEmits([
  /**
   * @event newFlog - Emitted when the user submits the form with a filename that doesn't
   * already exist in availableFlogs.
   * @property {string} filename - The filename entered by the user with the FLogger
   * extension added.
   */
  "newFlog",
  /**
   * @event openFlog - Emitted when the user submits the form with a filename that does
   * already exists in availableFlogs.
   * @property {IFlog} flog - The flog from availableFlogs selected by the user.
   */
  "openFlog",
]);

/**
 * A ref containing the user input filename string.
 * The standard FLogger file extension will be added to this.
 * @type {Ref<string>}
 */
const typedFilename = ref("");

/**
 * A ref flag that determines whether or not the submit button is displayed.
 * @type {Ref<boolean>}
 */
const showInput = ref(true);

/**
 * A ref flag that determines whether or not UI error elements are displayed.
 * @type {Ref<boolean>}
 */
const hasError = ref(false);

const props = defineProps({
  /**
   * @property {Array<IFlog>} availableFlogs - An array of existing flogs used for
   * autocompletion to open existing rather than creating a new flog.
   */
  availableFlogs: {
    type: Array<IFlog>,
    required: true,
  },
});

/**
 * A ref array of flogs in availableFlogs that match the partial (or full)
 * filename entered by the user.
 * @type {Ref<IFlog[]>}
 */
const matchedFlogs = ref<IFlog[]>([]);
// To show all flogs in drop-down when search term is empty, set this ref to [...props.availableFlogs]

/**
 * A ref flag to show/hide the dropdown of matchedFlogs.
 * @type {Ref<boolean>}
 */
 const showDropdown = ref(true);

/**
 * @watch 'availableFlogs' and 'typedFilename'
 */
watch(
  [() => props.availableFlogs as IFlog[], typedFilename],
  ([newItems, newFilename = ""]) => {
    matchedFlogs.value = newItems.filter((item) => {
      const filterTerm = newFilename.toLowerCase() || "";
      const matchTerm = item.url.toLowerCase().replace(/.flogger.txt$/g, "");
      const isMatch =
        (filterTerm != "" && matchTerm.includes(filterTerm)) || false;
      // To show all flogs in drop-down when search term is empty, change the above line to "filterTerm == "" || ..."
      return isMatch;
    });
  }
);

/**
 * Handler for creating a new flog.
 * Emits the newFlog event.
 * @method
 * @param {IFlog} flog - The selected flog
 * @returns {void} - No return value
 */
const submitAdd = () => {
  emit("newFlog", typedFilename.value + ".flogger.txt");
};

/**
 * Handler for selecting a flog from availableFlogs.
 * Emits the openFlog event.
 * @method
 * @param {IFlog} flog - The selected flog
 * @returns {void} - No return value
 */
const selectFlog = (flog: IFlog) => {
  typedFilename.value = flog.url;
  // Could skip selectedFlog and just emit flog without any checks?
  const selectedFlog = props.availableFlogs.filter((item) => item === flog);
  emit("openFlog", selectedFlog.length > 0 && selectedFlog[0]);
};

/**
 * Handler to close the dropdown of matchedFlogs.
 * @method
 */
const hideDropdown = () => {
  showDropdown.value = false;
};

/**
 * Handler to close the dropdown of matchedFlogs when user hits the Escape key.
 * @method
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    hideDropdown();
  }
};
</script>

<style scoped lang="stylus">

.autoc-select ul
  list-style none
  box-shadow 0 2px 4px rgba(0, 0, 0, 0.1)
  background-color var(--input-color)
  margin 0
  padding 0
  a
    padding 10px 15px
    display block
    &:hover
      background-color var(--input-color)


input.error
  border: 1px solid red;


input[type="submit"],
input[type="button"] {
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 6px 10px;
  margin: 10px 7px 0px 0px;
  cursor: pointer;
}

.filename-controls
    position: relative;

.filename
  background-color: var(--input-color);
  padding 20px
  border-radius: 14px
  font-weight: bold;
  border-color: lightsteelblue
  border-style solid
  font-size: 16px;
  outline-color: var(--input-color)
  width: 100%;
  box-sizing: border-box;

  @media screen and (min-width: 600px)
    max-width: 600px

  &:focus
    Xbox-shadow: 0 0 10px rgba(0, 0, 0, 0.5)
    Xborder-color transparent


.autoc-select {
  position: absolute;
}

.date-validation.error {
  display: block;
  color: red;
}

#add-flog label {
  margin-top: 20px;
}
</style>
