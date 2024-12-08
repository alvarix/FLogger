<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";

// Calling useDropboxFlogs to handle the auth flow,
// but don't need to use any vars or functions from it,
// so just calling it without the usual const destructuring assignments
useDropboxFlogs();

</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <h3>Dropbox Authorization in progress...</h3>
  </section>
</template>

<style scoped>

</style>
