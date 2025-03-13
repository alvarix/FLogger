<template>
  <h6 class="vue-file text-green-500 !text-lg">Intro.vue</h6>
  <p>
    Welcome to Flogger!<br />
    A project by
    <a href="https://alvarsirlin.com" target="_blank">Alvar</a> and
    <a href="https://chad.crume.org/" target="_blank">Chad</a>.<br />
    See the
    <a href="https://github.com/alvarix/FLogger/" target="_blank">Github</a>
    page for more info.
  </p>
  <p class="!text-blue-500">Connect to your DropBox account to begin.</p>

  <button class="dbx__btn" @click="launchConnectFlow">
    connect to DropBox
  </button>
</template>

<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
const { launchConnectFlow } = useDropboxFlogs();
</script>

<style>
@reference "../globalcss.styl";

p {
  @apply text-red-500;
}
</style>
