<script setup lang="ts">

const props = defineProps<{
  pretext?: string
}>()

</script>

<template>
  <form @submit.prevent="">
    <div class="form-inner">
      <div>
        <textarea
          autofocus
          id="pretext"
          v-model="props.pretext"
          disabled
          style="field-sizing: content"
        ></textarea>
      </div>
    </div>
  </form>
</template>

<style>
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
