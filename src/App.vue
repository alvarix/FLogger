<template>
  <main :class="{ connected: hasConnection }">
    <h6 class="vue-file">App.vue</h6>
    <Head /> 
    <div v-if="openFlogs.length == 0">
      <Suspense>
        <DropBoxFlogs />
      </Suspense>
    </div>
    <OpenFlogs />
  </main>
</template>

<script setup>
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";
import Head from "@/components/Head.vue";
import { onMounted, ref } from "vue";

const { openFlogs } = useFlogs();
const { loadedEntries } = useLoadedEntries();
const { clearConnection } = useDropboxFlogs();

</script>

<style scoped>
</style>
