<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
// import { defineEmits } from "vue";

const emit = defineEmits(["newFlog"]);
const newFlog = ref({ filename: "" }); // Initialize newFlog as a reactive variable

let typedFilename = ref("");

let showInput = ref(true);

let hasError = ref(false);

const props = defineProps({
  availableFlogs: {
    type: Array,
    required: true,
  },
});

const matchedFlogs = ref([]);
// To show all flogs in drop-down when search term is empty, set this ref to [...props.availableFlogs]

watch(
  [() => props.availableFlogs, typedFilename],
  ([newItems, newFilename = ""]) => {
    matchedFlogs.value = newItems.filter((item) => {
      let filterTerm = newFilename.toLowerCase() || "";
      let matchTerm = item.url.toLowerCase().replace(/.flogger.txt$/g, "");
      let isMatch =
        (filterTerm != "" && matchTerm.includes(filterTerm)) || false;
      // To show all flogs in drop-down when search term is empty, change the above line to "filterTerm == "" || ..."
      return isMatch;
    });
  }
);

const selectFlog = (flog) => {
  typedFilename.value = flog.url;
  // Could skip selectedFlog and just emit flog without any checks?
  let selectedFlog = props.availableFlogs.filter((item) => item === flog);
  emit("openFlog", selectedFlog.length > 0 && selectedFlog[0]);
};

const submitAdd = () => {
  newFlog.value.filename = typedFilename.value;
  emit("newFlog", newFlog);
};

// Add new ref to control dropdown visibility
const showDropdown = ref(true);

// Add new methods to handle hiding dropdown
const hideDropdown = () => {
  showDropdown.value = false;
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    showDropdown.value = false;
  }
};
</script>

<template>
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
  <form v-else id="add-flog" @submit.prevent="submitAdd" @mouseleave="hideDropdown" @keydown="handleKeydown">
      <div class="filename-controls">
        <input
          autofocus
          autocomplete="off"
          :class="['filename', { error: hasError }]"
          id="filename"
          type="text"
          placeholder="search or create new flog"
          v-model="typedFilename"
          @focus="showDropdown = true"
          @input="showDropdown = true"
        />
        <!-- required
          @change="change" -->
        <div class="autoc-select" v-show="showDropdown">
          <ul id="files">
            <li v-for="item in matchedFlogs">
              <a href="#" @click.prevent="() => selectFlog(item)">{{
                item.path_display ?? item.url
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
