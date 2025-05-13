<template>
  <header>
    <input class="btn-prefs" type="image" src="/icon-gear.svg" />
    <dialog ref="dialog">
      <div class="theme-controls">
        <ThemeSwitcher />

        <div
          id="authed-section"
          :style="{
            display: hasConnection ? 'block' : 'none',
          }"
        >
          <button class="dbx__btn small" @click="disconnect">
            <img
              alt="Dropbox account"
              src="/Dropbox_Icon.svg"
              width="16"
              height="16"
            />
            Disconnect {{ accountOwnerValue }}
          </button>

          <button class="small" @click="fileView">
            {{ fileViewOn ? "Turn off File view" : "Turn on File view" }}
          </button>
        </div>
        <form method="dialog" class="text-center mt-8">
          <button formmethod="dialog" class="small">Close</button>
        </form>
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
        </pre
      >
    </h1>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useFlogSource } from "@/composables/useFlogSource";
import ThemeSwitcher from "@components/ThemeSwitcher.vue";
import { IFlogSourceType } from "@/modules/Flog";

const { hasConnection, accountOwner, clearConnection } = useFlogSource(
  IFlogSourceType.dropbox
);
const dialog = ref<HTMLDialogElement | null>(null);
const fileViewOn = ref(false);

const accountOwnerValue = ref(accountOwner.value);

watch(
  accountOwner,
  () => {
    accountOwnerValue.value = accountOwner.value;
  },
  { immediate: true }
);

onMounted(() => {
  const modalBtn = document.querySelector(".btn-prefs");

  if (modalBtn && dialog.value) {
    modalBtn.addEventListener("click", () => {
      if (dialog.value !== null) dialog.value.showModal();
    });
  }
});

const disconnect = () => {
  clearConnection();
  if (dialog.value !== null) dialog.value.close();
};

const fileView = () => {
  fileViewOn.value = !fileViewOn.value;
  const fileElements = document.querySelectorAll<HTMLElement>(".vue-file");
  fileElements.forEach((el) => {
    const element = el;
    // Toggle display between "none" and "block"
    const currentDisplay = window.getComputedStyle(element).display;
    element.style.display = currentDisplay === "none" ? "block" : "none";
  });
};
</script>

<style scoped>
.btn-prefs {
  background-color: transparent;
  width: 20px;
  height: 20px;
  color: var(--color);
  justify-self: flex-end;
}
#logo {
  margin-bottom: 0;
  padding-bottom: 0;
}
header {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
}
.dbx__btn {
  display: flex;
  align-items: center;
  gap: 5px;
}
dialog {
  margin: auto;
  padding: 20px;
  border-radius: 14px;
  background: var(--bg-color);
}
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
</style>
