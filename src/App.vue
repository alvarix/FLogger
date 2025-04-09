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
    
    <div class="message"></div>
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


<style>
.message {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  text-align: center;
  z-index: 1000;
  transition: all 0.5s ease;
  opacity: 0;
}
</style>