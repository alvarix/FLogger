<!-- 
// This component is meant to be used as a stand-alone route page 
// where the Dropbox Auth flow is started using the Db auth URL 
// provided by the SDK DropboxAuth.getAuthenticationUrl(redirectUri, ...), 
// with redirectUri returning the user to this page.
 -->
<template>
  <div>
    <h1>Flogger Dropbox Auth Pop-up!</h1>
  </div>
  <Suspense>
    <DropBoxAuth />
  </Suspense>
</template>

<script setup>
import DropBoxAuth from "@/components/DropBoxAuth.vue";
</script>

<style scoped>
h2 {
  font-size: 2em;
}

* {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
    "DejaVu Sans Mono", monospace;
}
</style>
