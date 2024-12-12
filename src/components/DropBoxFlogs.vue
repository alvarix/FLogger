<script setup>
import { useDropboxFlogs } from "@/composables/useDropboxFlogs";
import { useFlogs } from "@/composables/useFlogs";
import AddFlog from "@/components/AddFlog.vue";
import { useDropboxFiles } from "@/composables/useDropboxFiles";
// const { accountInfo } = useDropboxFiles();

const {
  launchConnectFlow,
  hasConnection,
  clearConnection,
  availableFlogs,
  loadFlogEntries,
  addFlog
} = useDropboxFlogs();

const { openFlog } = useFlogs();
// const props = defineProps({});

const selectFile = (file) => {
  console.log("selectFile", file);
  loadFlogEntries(file);
  openFlog(file);
};

function handleAddFlog(flogData) {
  console.log("Not implemented yet", flogData.value.filename);
  addFlog({
    url: flogData.value.filename + ".flogger.txt",
    loadedEntries: [],
  });
}
</script>

<template>
  <section class="container main">

    <!-- 
    dev note:
    Should this intro text live elsewhere?
    -->
    <div
      id="pre-auth-section"
      :style="{ display: hasConnection ? 'none' : 'block' }"
    >
    <p>
      Welcome to Flogger!<br/>
      A project by Alvar and Chad.<br/>
      See the <a href='https://github.com/alvarix/FLogger/' target='_blank'>Github</a> page for more info.
    </p>
    <p>
      Connect to your Dropbox account to begin.
    </p>

      <button class="dbx__btn" @click="launchConnectFlow">connect to DropBox</button>
    </div>

    <div
      id="authed-section"
      :style="{ display: hasConnection ? 'block' : 'none' }"
    >
      <button  class="dbx__btn" @click="clearConnection">Disconnect</button>
      <AddFlog @newFlog="handleAddFlog" @openFlog="selectFile" :availableFlogs="availableFlogs"/>
    </div>
    
    <div id="files-section">
      <ul id="files">
        <li v-for="item in availableFlogs">
          <a href="#" @click.prevent="() => selectFile(item)">{{
            item.path_display ?? item.url
          }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="stylus">
button 
  margin-bottom 20px

#add-entry *:not(.date-validation) {
  display: block;
}

input.error {
  border: 1px solid red;
}

.date-validation.error {
  display: block;
  color: red;
}

#add-entry label {
  margin-top: 20px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  padding: 0.5em;
  margin: 0.5em;
}
</style>
