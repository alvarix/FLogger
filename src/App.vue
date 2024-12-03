<template>
  <div>
    <h1>
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
</template>

<script setup>
import { ref } from "vue";
import EntryList from "@/components/EntryList.vue";
import AddEntry from "@/components/AddEntry.vue";
import DropBoxFlogs from "@/components/DropBoxFlogs.vue";
import OpenFlogs from "@/components/OpenFlogs.vue";
import { useFlogs } from "@/composables/useFlogs";
import { useLoadedEntries } from "@/composables/useLoadedEntries.ts";

const { openFlogs } = useFlogs();
const { loadedEntries, loadEntries, loadEntry } = useLoadedEntries();

const timestamp = ref(new Date().toLocaleDateString());

function addNewEntry(entryData) {
  console.log("Not implemented yet");
}
</script>

<style lang="stylus"> 
h1 pre 
  font-size 8px
  font-family monospace

h2 {
  font-size: 2em;
}

* {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
    "DejaVu Sans Mono", monospace;
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  min-width: 320px;
  min-height: 100vh;
}

h1, h2, h3, h4 {
  line-height: 1.1;
  padding: 1em 0;
}
h1 {
  font-size: 3.5em;
}
h2 {
  font-size: 2.8em;
}
h3 {
  font-size: 2.1em;
}
h4 {
  font-size: 1.4em;
}


#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

button { 
  cursor: pointer;
  font-size: 1.2rem;
  padding: 10px 15px;
}

@media (prefers-color-scheme: light) {

  button {
  }
}

body {
  background-color: Canvas;
  color: CanvasText;
  color-scheme: light dark;
}


/* TW */
.hidden {
  display: none;
}
</style>
