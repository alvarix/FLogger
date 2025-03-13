<template>
  <main :class="{ connected: hasConnection }">
    <h6 class="vue-file">App.vue</h6>
    <div class="header">
      <input class="btn-prefs" type="image" src="/icon-gear.svg" />

      <dialog ref="dialog">
        <div class="theme-controls">
          <ThemeSwitcher />
          <div
            id="authed-section"
            :style="{ display: hasConnection ? 'block' : 'none' }"
          >
            <button class="dbx__btn small" @click="clearConnection">
              <img
                alt="Dropbox account"
                src="/Dropbox_Icon.svg"
                width="16"
                height="16"
              />
              Disconnect {{ accountOwner }}
            </button>
            <form method="dialog" class="text-center mt-8">
              <button formmethod="dialog" class="small">Close</button>
            </form>
          </div>
        </div>
      </dialog>

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

<script setup>
import { useDropboxFiles } from "@/composables/useDropboxFiles";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import { useDropboxFlogs } from "@/composables/useDropboxFlogs.ts";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { onMounted, ref } from "vue";

const { accountOwner } = useDropboxFiles();
const { openFlogs } = useFlogs();
const { hasConnection } = useDropboxFlogs();
const { loadedEntries } = useLoadedEntries();
const { clearConnection } = useDropboxFlogs();

const dialog = ref(null);

onMounted(() => {
  const modalBtn = document.querySelector(".btn-prefs");

  if (modalBtn && dialog.value) {
    modalBtn.addEventListener("click", () => {
      dialog.value.showModal();
    });
  }
});
</script>

<style scoped lang="stylus">
 .btn-prefs
  background-color transparent
  width 20px
  height 20px
  color var(--color)
  justify-self flex-end

#logo
    margin-bottom 0
    padding-bottom 0

 .header
    display flex
    flex-direction row-reverse
    justify-content space-between

  .dbx__btn
    display flex
    align-items center
    gap 5px

  dialog
    margin auto
    padding 20px
    border-radius 14px
    background var(--bg-color)
    &::backdrop
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
</style>
