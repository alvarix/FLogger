
<script setup>
import { useDropboxFiles } from "@/composables/useDropboxFiles";
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
const { clearConnection } = useDropboxFlogs();

</script>

<template>
  <main :class="{ 'connected' : hasConnection }">
    <div class="header">

      <div class="theme-controls">
        <ThemeSwitcher />
        
        <div
          id="authed-section"
          :style="{ display: hasConnection ? 'block' : 'none' }"
        >
          <button class="dbx__btn small" @click="clearConnection">
            <img alt="Dropbox account" src="/Dropbox_Icon.svg" width="16" height="16"> Disconnect {{ accountOwner }}
          </button>
        </div>
      </div>
      

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
  </main>
  </template>

 <style scoped lang="stylus">
 
#logo
    margin-bottom 0
    padding-bottom 0

 .header 
    display flex
    flex-direction row-reverse
    justify-content space-between
    @media (max-width: 499px)
        flex-direction column
    
  .dbx__btn
    display flex
    align-items center
    gap 5px
</style>
