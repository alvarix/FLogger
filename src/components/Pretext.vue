<template>  
  <aside class="vue-file">Pretext.vue</aside>

  <button class="small popbutton" popovertarget="my-popover">Flog Info</button>
  <div id="my-popover" popover class="popover">
    <div class="pretext">
      <button class="small popbutton" popovertarget="my-popover" popovertargetactin="hide">
        close
      </button>

      <div v-if="!isEditing" @click="edit" class="pretext__body">
        <pre class="pretext__pre">{{ props.pretext }}</pre>
      </div>

      <!-- Display a textarea if editing -->
      <textarea
        v-else
        ref="pretextTextarea"
        class="pretext__textarea auto-resize"
        @blur="save"
        v-model="pretextValue"
        :readOnly="readOnly"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, nextTick } from "vue";

const props = defineProps<{
  pretext?: string;
  readOnly?: boolean;
}>();

// Emits an event to the parent
const emit = defineEmits(["update-pretext"]);

let isEditing = ref(false);
const pretextTextarea = ref(null);
const pretextValue = ref(props.pretext);
// console.log('pretextValue', pretextValue)

function edit() {
  isEditing.value = true;
  pretextValue.value = props.pretext;
  // textarea isnt in dom yet, so next click needed
  nextTick(() => {
    if (pretextTextarea.value) {
      pretextTextarea.value.focus({ preventScroll: true });
      // auto resize
      pretextTextarea.value.style.height =
        pretextTextarea.value.scrollHeight + "px";
      // Set cursor position to the start of the text
      pretextTextarea.value.selectionStart = 0;
      pretextTextarea.value.selectionEnd = 0;
      // scroll to
      pretextTextarea.value.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// Function to emit the update when blur occurs
function save() {
  // console.log('save pretextValue', pretextValue)
  emit("update-pretext", pretextValue);
  isEditing.value = false;
}
</script>

<style lang="styl" scoped>

.popbutton {
  margin: 1rem 0rem;
}

.popover
  font-weight: 400;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  max-width: 20ch;
  line-height: 1.4;
  border:0
  top: 2rem;
  margin: 0 auto;
  box-shadow 0 0 6px #999



.pretext__body {
  background-color: var(--misc-color);
}

.pretext__pre
  white-space: pre-wrap;

.pretext__body,
.pretext__textarea {
  font-size: 16px;
  font-family: var(--font);
  width 100%
  box-sizing border-box
}

.pretext__body,
.pretext textarea,
.pretext input {
  text-align: left;
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
  padding: 10px 20px ;
}

.pretext__textarea {
  background-color: var(--input-color);
  max-width: 95%;
}

.pretext__body:hover {
  background-color: var(--input-color);
}
</style>
