<template>
  <main :class="{ connected: hasConnection }">
    <h6 class="vue-file">App.vue</h6>

    <Head /> 

    <Suspense>
      <Login />
    </Suspense>

    <div v-if=hasConnection>
      <Flog />
    </div>

  </main>
</template>

<script setup>
import Login from "@/components/Login.vue";
import Flog from "@/components/Flog.vue";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import Head from "@/components/Head.vue";
const { hasConnection } = useDropboxFlogs();
</script>

<style scoped>
</style>
