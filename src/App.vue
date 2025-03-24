<template>
  <main :class="{ connected: hasConnection }">
  <aside class="vue-file">App.vue</aside>

    <Head /> 

    <Suspense>
      <Login />
    </Suspense>

    <div v-if="openFlogs.length == 0">
      <Suspense>
        <FlogList />
      </Suspense>
    </div>
    <Flog />


  </main>
</template>

<script setup>
import { ref, watch } from "vue";
import Login from "@/components/Login.vue";
import FlogList from "@/components/FlogList.vue";
import Flog from "@/components/Flog.vue";
import { useFlogs } from "@/composables/useFlogs.ts";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import Head from "@/components/Head.vue";
const { hasConnection } = useDropboxFlogs();
const ShowFlogList = ref(false);
const { openFlogs } = useFlogs();
</script>
