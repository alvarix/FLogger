<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
// import { defineEmits } from "vue";

const emit = defineEmits(["newFlog"]);
const newFlog = ref({ filename: "" }); // Initialize newFlog as a reactive variable

let showInput = ref(false);

let hasError = ref(false);

const submitAdd = () => {
  emit("newFlog", newFlog);
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
  <form v-else id="add-flog" @submit.prevent="submitAdd">
    <div class="form-inner">
      <div>
        <input
          :class="['filename', { error: hasError }]"
          id="filename"
          type="text"
          :placeholder="newFlog.filename"
          v-model="newFlog.filename"
          required
        />
        <em class="date-validation hidden" :class="{ error: hasError }"
          >Please enter valid file name</em
        >
      </div>
    </div>
    <div>
      <input type="submit" value="Add Flog" /> 
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
}

.date-validation.error {
  display: block;
  color: red;
}

#add-flog label {
  margin-top: 20px;
}
</style>
