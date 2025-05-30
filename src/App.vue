<template>
  <main :class="{ connected: hasConnection }">
    <aside class="vue-file">App.vue</aside>
    <FloggerHead />

    <Suspense>
      <DropboxLogin />
    </Suspense>

    <div v-if="openFlogs.length == 0">
      <Suspense>
        <FlogList />
      </Suspense>
    </div>
    <div v-else>
      <div v-for="flog in openFlogs" :key="flog.url">
        <EditFlog :flog="flog" />
      </div>
    </div>

    <div class="message"></div>
  </main>
</template>

<script setup lang="ts">
import DropboxLogin from "@components/DropboxLogin.vue";
import FlogList from "@components/FlogList.vue";
import EditFlog from "@components/EditFlog.vue";
import { useOpenFlogs } from "@/composables/useOpenFlogs.ts";
import { useFlogSource, IFlogSourceType } from "@/composables/useFlogSource.ts";
import FloggerHead from "@components/FloggerHead.vue";

const { hasConnection } = useFlogSource(IFlogSourceType.dropbox);
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
