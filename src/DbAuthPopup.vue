<!-- 
// This component is meant to be used as a stand-alone route page 
// where the Dropbox Auth flow is started using the Db auth URL 
// provided by the SDK DropboxAuth.getAuthenticationUrl(redirectUri, ...), 
// with redirectUri returning the user to this page.
 -->
<template>
  <div id="spinner">
    <PacmanLoader :loading="true" :color="loaderProps.color" :size="loaderProps.size"></PacmanLoader>  </div>
  <Suspense>
    <DropBoxAuth />
  </Suspense>
</template>

<script setup lang="ts">
import DropBoxAuth from "@components/DropBoxAuth.vue";
// @ts-expect-error - vue-spinner typing issue
import PacmanLoader from 'vue-spinner/src/PacmanLoader.vue'

const loaderProps = {
  size: undefined,
  color: undefined,
};
</script>

<style scoped>
.spinner {
  text-align: center;
  width: 100%;
}

* {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif
}
</style>
