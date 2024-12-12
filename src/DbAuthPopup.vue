<!-- 
// This component is meant to be used as a stand-alone route page 
// where the Dropbox Auth flow is started using the Db auth URL 
// provided by the SDK DropboxAuth.getAuthenticationUrl(redirectUri, ...), 
// with redirectUri returning the user to this page.
 -->
<template>
  <div id="spinner">
    <PacmanLoader :loading="loading" :color="color" :size="size"></PacmanLoader>  </div>
  <Suspense>
    <DropBoxAuth />
  </Suspense>
</template>

<script setup>
import DropBoxAuth from "@/components/DropBoxAuth.vue";
import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'
</script>

<style scoped>
.spinner {
  text-align: center;
  width: 100%;
}

* {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
    "DejaVu Sans Mono", monospace;
}
</style>
