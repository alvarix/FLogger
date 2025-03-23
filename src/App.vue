<template>
  <main :class="{ connected: hasConnection }">
  <aside class="vue-file">App.vue</aside>

    <Head /> 

    <Suspense>
      <Login />
    </Suspense>

    <div v-if=hasConnection>
      <div v-if="ShowFlogList">
        <FlogList />
      </div>
      <div v-else>
        <Flog @FlogList="ShowFlogList = true"  />
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, watch } from "vue";
import Login from "@/components/Login.vue";
import FlogList from "@/components/FlogList.vue";
import Flog from "@/components/Flog.vue";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import Head from "@/components/Head.vue";
const { hasConnection } = useDropboxFlogs();
const ShowFlogList = ref(false);
watch(ShowFlogList, (newValue) => {
  console.log("ShowFlogList toggled:", newValue);
});
</script>

<style scoped>
</style>
