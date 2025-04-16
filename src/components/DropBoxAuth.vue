<template>
  <!-- Example description and UI -->
  <section class="container main">
    <h3>Dropbox Authorization in progress...</h3>
  </section>
</template>

<script setup>
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource.ts";

// Calling useFlogSource to handle the flow to check authentication,
// but don't need to use any vars or functions from it,
// so just calling it without the usual const destructuring assignments
useFlogSource(IFlogSourceType.dropbox);

</script>

<style scoped>

</style>
