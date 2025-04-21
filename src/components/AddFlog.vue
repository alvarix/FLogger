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
import { ref, watch } from "vue";
import type { IFlog } from "@/modules/Flog";
// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
// import { defineEmits } from "vue";

const emit = defineEmits(["newFlog", "openFlog"]);

const typedFilename = ref("");

const showInput = ref(true);

const hasError = ref(false);

const props = defineProps({
  availableFlogs: {
    type: Array<IFlog>,
    required: true,
  },
});

const matchedFlogs = ref<IFlog[]>([]);
// To show all flogs in drop-down when search term is empty, set this ref to [...props.availableFlogs]

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

const selectFlog = (flog: IFlog) => {
  typedFilename.value = flog.url;
  // Could skip selectedFlog and just emit flog without any checks?
  const selectedFlog = props.availableFlogs.filter((item) => item === flog);
  emit("openFlog", selectedFlog.length > 0 && selectedFlog[0]);
};

const submitAdd = () => {
  emit("newFlog", typedFilename.value + ".flogger.txt");
};

// Add new ref to control dropdown visibility
const showDropdown = ref(true);

// Add new methods to handle hiding dropdown
const hideDropdown = () => {
  showDropdown.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    showDropdown.value = false;
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
