<template>
  
  <aside class="vue-file">AddEntry.vue</aside>
  <form id="add-entry" @submit.prevent="submitAdd">
    <div class="form-inner">
      <div>
        <input
          :class="['date', { error: hasError }]"
          id="time"
          type="text"
          :placeholder="form.date"
          v-model="form.date"
          required
        />
        <em class="date-validation hidden" :class="{ error: hasError }"
          >Please enter valid date</em
        >
      </div>
      <div>
        <textarea
          class="auto-resize"
          autofocus
          id="entry"
          name=""
          v-model="form.entry"
          required
        ></textarea>
      </div>
    </div>
    <div><button class="big" type="submit">Add Entry</button></div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import EntryData from "@/modules/EntryData.ts";
import { defineEmits } from "vue";

const props = defineProps({
  entryValue: EntryData | undefined, // Accept the copied entry as a prop
});

const emit = defineEmits(["newEntry"]);
const newEntry = ref(""); // Initialize newEntry as a reactive variable

let hasError = ref(false);

const datetime = new Date();
let form = ref(
  new EntryData(`${datetime.toLocaleDateString("en-US")} ${datetime.toLocaleTimeString("en-US")}`, props.entryValue || "")
);

const submitAdd = (event) => {
  emit("newEntry", form);
  const datetime = new Date();
  form.value = new EntryData(`${datetime.toLocaleDateString("en-US")} ${datetime.toLocaleTimeString("en-US")}`, props.entryValue || "");
};

// Function to automatically resize the textarea based on content
const autoResizeTextarea = (el_id) => {
  const textarea = document.getElementById(el_id);
  if (textarea) {
    textarea.style.height = "auto"; // Reset height to shrink if needed
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height based on scrollHeight
  }
};

// this watch is triggered when copying an entry
watch(
  () => props.entryValue,
  (newVal) => {
    if (!newVal || !newVal?.entry) {
      form.value.entry = "";
    } else if (newVal?.entry) {
      form.value.entry = newVal.entry; // Prepopulate the textarea with the copied entry
      const addEntryForm = document.getElementById("add-entry");

      // nextTick(() => autoResizeTextarea("entry")); // Adjust the textarea size after the DOM update

      if (addEntryForm) {
        addEntryForm.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the form
      }
	}
  }
);
</script>

<style scoped>

/*
.big
  display: flex
  align-items: center
  justify-content: center
  width: 30vw
  height: 30vw
  @media screen and (min-width: 600px)
    width: 10vw
    height: 10vw
    
  border-radius: 50%
  background-color: var(--button-color);
  color: var(--color)
  font-size: 10vw
  font-weight: bold
  position: relative
  border: none
  cursor: pointer

  &::before,
  &::after
    content: ""
    position: absolute
    background-color: currentColor

  &::before
    width: 50%
    height: 10%

  &::after
    width: 10%
    height: 50%

*/


input.error {
	border: 1px solid var(--red-color);
}

.form-inner .date {
	background: none;
	margin-left: 10px;
}
.form-inner textarea {
    max-width: 600px;
    height: 50vw;
    border-radius: 14px;
    padding: 20px;
}

input.date {
	font-weight: bold;
	border: none;
}

input, textarea {
	padding: 5px;
	font-size: 16px;
}

textarea {
	width: 100%;
	box-sizing: border-box;
}

.date-validation.error {
	display:block;
	color:var(--red-color);
}

input[type=submit] {
	border-radius: 10px;
	padding: 6px 10px;
	margin-top: 10px;
	cursor: pointer;
}

#add-entry label {
	margin-top: 20px;
}
</style>
