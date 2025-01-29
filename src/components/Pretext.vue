<script setup lang="ts">

const props = defineProps<{
  pretext?: string
}>()

</script>

<template>
  <button class='small popbutton' popovertarget="my-popover">Flog Info</button>
  <div v-text="props.pretext" id="my-popover" popover class="popover"> </div>
</template>

<style lang="styl" scoped>


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

form {
  padding: 0px 0px 10px 0px;
  margin: 0px 0px 42px 0px;
}

.form-inner,
.form-inner * {
  background-color: var(--input-color);
}

.form-inner {
  max-width: 600px;
  border-radius: 14px;
  padding: 20px;
}

textarea {
  padding: 5px;
  width: 100%;
  border: 1px solid red;
}
</style>
