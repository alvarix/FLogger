<template>
  <aside class="vue-file">AddEntry.vue</aside>

  <form id="add-entry" @submit.prevent="submitAdd">
    <div class="form-inner">
      <div class='date_wrap'>
        <input
          id="time"
          v-model="entryDate"
          :class="['date', { error: hasError }]"
          type="text"
          :placeholder="defaultFormEntry.date.toLocaleString('en-US')"
          required
        />
        <em class="date-validation hidden" :class="{ error: hasError }"
          >Please enter valid date</em
        >
      </div>
      <div class="entry__body-div">
        <pre
          id="entry"
          ref="entryEl"
          name=""
          class="entry__body"
          contenteditable
          >{{ defaultFormEntry.entry }}</pre >
      </div>
      <div><button class="big" type="submit">Add Entry</button></div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import EntryData from "@/modules/EntryData";
// as per compiler: [@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported.
// import { defineEmits } from "vue";
import { placeCursorAtEnd } from "@/modules/utilities";

const props = defineProps({
  entryValue: {
    type: EntryData,
    required: false,
    default: function () {
      return undefined;
    },
  }, // Accept the copied entry as a prop
});


onMounted(() => {
  const entryElement = document.getElementById("entry");
      if (entryElement) {
        entryElement.focus();
      } else {
        console.warn("Element with ID 'entry' not found on mount.");
      }
});


const emit = defineEmits(["newEntry"]);

const datetime = new Date();

const defaultFormEntry = new EntryData(
  // `${datetime.toLocaleDateString("en-US")} ${datetime.toLocaleTimeString(
  //   "en-US"
  // )}`,
  datetime,
  props.entryValue?.entry || ""
);

const entryDate = ref(defaultFormEntry.date);
const entryEl = ref<HTMLElement | null>(null); // Element ref for the contenteditable

const hasError = ref(false);

const submitAdd = () => {
  // emit the event with a
  emit(
    "newEntry",
    new EntryData(
      entryDate.value,
      (entryEl.value !== null && entryEl.value.innerText) || ""
    )
  );
  // Reset the form data
  entryDate.value = defaultFormEntry.date;
  if (entryEl.value !== null) entryEl.value.innerText = defaultFormEntry.entry;
};

// this watch is triggered when copying an entry
watch(
  () => props.entryValue,
  (newVal) => {
    if (!newVal || !newVal?.entry) {
      if (entryEl.value !== null) entryEl.value.innerText = "";
    } else if (newVal?.entry) {
      if (entryEl.value !== null) entryEl.value.innerText = newVal.entry; // Prepopulate the textarea with the copied entry

      nextTick(() => {
        if (entryEl.value && entryEl.value != null) {
          // Set cursor position to the end of the text
          placeCursorAtEnd(entryEl.value);
          // Smooth scroll to the entryEl
          entryEl.value.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the entryEl
          entryEl.value.focus();
        }
      });
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



#add-entry .form-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  

    pre, .entry__body {
        height:100%
    }
  
}

.entry__body-div {
  flex-grow:1;
}

input.error { 
  border: 1px solid var(--red-color);
}

.form-inner .date {
  background: none;
  margin-left: 10px;
}

input.date {
  font-weight: bold;
  border: none;
}

#time {
  field-sizing: content;
}

input {
  padding: 5px;
  font-size: 16px;
}

.date-validation.error {
  display: block;
  color: var(--red-color);
}

input[type="submit"] {
  border-radius: 10px;
  padding: 6px 10px;
  margin-top: 10px;
  cursor: pointer;
}

#add-entry label {
  margin-top: 20px;
}
</style>
<style lang="styl" scoped>

h3
  font-weight 700
  font-size 14px
  margin 50px 0 20px 20px





.entry__body
  background-color: var(--misc-color)
  max-width: 600px;
  border-radius: 14px;
  white-space: pre-wrap; /* Enables wrapping of text, preserving spaces and line breaks */
  word-wrap: break-word; /* Breaks long words to prevent overflow */
  font-size: 16px;
  font-family: var(--font);
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  max-width: 600px;
  padding: 10px 20px ;


.entry__textarea {
  background-color: var(--input-color);
  max-width: 95%;
}

.entry__body:hover {
  background-color: var(--input-color);
}
</style>
