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
    <div v-else>
      <div v-for="flog in openFlogs" :key="flog.url">
        <Flog :flog="flog" />
      </div>  
    </div>

  </main>
</template>

<script setup>
import { ref, watch } from "vue";
import Login from "@/components/Login.vue";
import FlogList from "@/components/FlogList.vue";
import Flog from "@/components/Flog.vue";
import { useOpenFlogs } from "@/composables/useOpenFlogs.ts";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import Head from "@/components/Head.vue";
const { hasConnection } = useDropboxFlogs();
const ShowFlogList = ref(false);
const { openFlogs } = useOpenFlogs();
</script>
