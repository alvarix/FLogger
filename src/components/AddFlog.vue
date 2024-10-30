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
      let isMatch = filterTerm != "" && matchTerm.includes(filterTerm) || false;
      // To show all flogs in drop-down when search term is empty, change the above line to "filterTerm == "" || ..."
      return isMatch;
    });
  }
);

const selectFile = (file) => {
  typedFilename.value = file.path_lower
}

const submitAdd = () => {
  newFlog.value.filename = typedFilename.value;
  emit("newFlog", newFlog);
};

// const change = () => {
//   console.log("change", availableFlogs);
//   // matchedFlogs.value = ['hi']
//   matchedFlogs.value = availableFlogs.filter((flogItem, i) => {
//     console.log(i, flogItem.filename, typedFilename);
//     return flogItem.includes(typedFilename);
//   });
// };
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
  <form v-else id="add-flog" @submit.prevent="submitAdd">
    <div class="form-inner">
      <div class="filename-controls">
        <input
          :class="['filename', { error: hasError }]"
          id="filename"
          type="text"
          placeholder="search or create new flog"
          v-model="typedFilename"
        />
        <!-- required
          @change="change" -->
        <div class="autoc-select">
          <ul id="files">
            <li v-for="item in matchedFlogs">
              <a href="#" @click.prevent="() => selectFile(item)">{{
                item.path_display ?? item.url
              }}</a>
            </li>
          </ul>
        </div>
        <em class="date-validation hidden" :class="{ error: hasError }"
          >Please enter valid file name</em
        >
      </div>
    </div>
    <div>
      <input
        type="button"
        value="Cancel"
        @click="
          () => {
            showInput = false;
          }
        "
      />
    </div>
  </form>
</template>

<style scoped>
input.error {
  border: 1px solid red;
}

input[type="submit"],
input[type="button"] {
  display: inline-block;
  background-color: cornsilk;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 6px 10px;
  margin: 10px 7px 0px 0px;
  cursor: pointer;
}

.form-inner,
.form-inner * {
  background-color: cornsilk;
}

.filename-controls {
  position: relative;
}

.form-inner {
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #ccc;
}

input.filename {
  font-weight: bold;
  font-size: 14px;
  border: none;
  color: cornflowerblue;
  padding: 5px;
  width: 100%;
  /* height: 2rem; */
}

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
