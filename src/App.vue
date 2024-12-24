
<script setup>
import { useDropboxFiles } from "@/composables/useDropboxFiles";
import EntryList from "@/components/EntryList.vue";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const { accountOwner } = useDropboxFiles();
const { openFlogs } = useFlogs();
const { hasConnection } = useDropboxFlogs();
const { loadedEntries } = useLoadedEntries();


</script>

<template>
  <div :class="{ 'connected' : hasConnection }">
    <ThemeSwitcher />
    
    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
      <button class="dbx__btn small" @click="clearConnection">
        <img src="/Dropbox_Icon.svg" width="16" height="16"> Disconnect {{ accountOwner }}
      </button>
    </div>
    

    <div>
      <h1 id="logo">
        <pre>
███████╗██╗      ██████╗  ██████╗  ██████╗ ███████╗██████╗ 
██╔════╝██║     ██╔═══██╗██╔════╝ ██╔════╝ ██╔════╝██╔══██╗
█████╗  ██║     ██║   ██║██║  ███╗██║  ███╗█████╗  ██████╔╝
██╔══╝  ██║     ██║   ██║██║   ██║██║   ██║██╔══╝  ██╔══██╗
██║     ███████╗╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║
╚═╝     ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
        </pre>
      </h1>
    </div>
    <div v-if="openFlogs.length == 0">
      <Suspense>
        <DropBoxFlogs />
      </Suspense>
    </div>
    <OpenFlogs />
    <br />
    <EntryList :entries="loadedEntries || []" />
  </div>
  </template>

 <style scoped lang="stylus">
  .dbx__btn
    position absolute
    top 55px
    right 20px
    margin-top 0
    display flex
    align-items center
    gap 5px
</style>
