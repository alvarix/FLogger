<script setup>
import { ref } from "vue";
import fetch from "isomorphic-fetch";
import qs from "qs";
import { useLoadedEntries } from "../composables/useLoadedEntries.ts";

const { loadEntries, loadEntriesFromString } = useLoadedEntries();

const props = defineProps({});

const hostname = "localhost";
const port = 5173;
var CLIENT_ID = "irjhf3obwytvv53"; //flogger-ccc4
//"lsu851xgok0qryy"; //Flogger Starscream
//"k2i486lvdpfjyhj"; //"q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x

const config = {
  fetch,
  clientId: CLIENT_ID,
};

import { Dropbox, DropboxAuth } from "dropbox";
// See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html

const dbxAuth = new DropboxAuth(config);

const dbxAuthReturnUri = `http://${hostname}:${port}/`;

const doAuth = () => {
  console.log("doAuth");
  dbxAuth
    .getAuthenticationUrl(
      dbxAuthReturnUri,
      undefined,
      "code",
      "offline",
      undefined,
      undefined,
      true
    )
    .then((authUrl) => {
      clearDbxSession();
      window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
      console.log("dbxAuth.codeVerifier", dbxAuth.codeVerifier);
      window.location.href = authUrl;
    })
    .catch((error) => console.error(error));
};

// Parses the url and gets the access token if it is in the urls hash
const getDbxAuthCodeFromUrl = () => {
  const params = new URL(window.location).searchParams;
  const code = params.get("code");
  // console.log(`getDbxAuthCodeFromUrl: ${code}`);
  return code;
};
const removeAuthCodeFromUrl = (urlString) => {
  let url = new URL(urlString);
  // console.log("url before", url.toString());
  url.searchParams.delete("code");
  // console.log("url after", url.toString());
  return url.toString();
};

const dbxAuthCode = ref(getDbxAuthCodeFromUrl());
const hasRedirectedFromAuth = ref(!!dbxAuthCode.value);

const fileItems = ref([]);
const loadedFile = ref();
const fileContents = ref({});

if (hasRedirectedFromAuth.value) {
  console.log(`dbxAuthReturnUri`, dbxAuthReturnUri);
  console.log(`dbxAuthCode`, dbxAuthCode.value);

  const codeVerifier = window.sessionStorage.getItem("codeVerifier");
  console.log(`codeVerifier:`, codeVerifier);
  dbxAuth.setCodeVerifier(codeVerifier);
  const reloadUrl = removeAuthCodeFromUrl(window.location.href);
  console.log("reloadUrl", reloadUrl);
  console.log("step 1");
  dbxAuth
    // 1. Get token
    .getAccessTokenFromCode(dbxAuthReturnUri, dbxAuthCode.value)
    // 2. Save token and reload
    .then((response) => {
      console.log("step 2");
      window.sessionStorage.setItem(
        "accessToken",
        response.result.access_token
      );
      window.location.href = removeAuthCodeFromUrl(window.location.href);
    })
    .catch((e) => {
      console.log("Error getting access token from URL:", e.error || e);
      window.location.href = removeAuthCodeFromUrl(window.location.href);
    });
  // .catch((error) => {
  //   console.error(error.error || error);
  // });
}

// 3. Get token
let accessToken = window.sessionStorage.getItem("accessToken");
if (accessToken && accessToken != "") {
  console.log("step 3a from sessionStorage");
  dbxAuth.setAccessToken(accessToken);
} else {
  console.log("step 3b check from dbxAuth");
  window.sessionStorage.removeItem("accessToken");
  accessToken = dbxAuth.getAccessToken();
}

console.log("accessToken:", accessToken);

if (accessToken) {
  // 4. Check/refresh token
  dbxAuth.checkAndRefreshAccessToken();
  // 5. Use token to get files
  console.log("step 5");
  var dbx = new Dropbox({
    auth: dbxAuth,
  });
  dbx
    .filesListFolder({
      path: "",
    })
    // 6. Set fileItems to display
    .then((response) => {
      console.log("step 6");
      fileItems.value = response.result.entries
        .filter((item) => item.path_lower.endsWith(".flogger"))
        .map((item) => {
          console.log("item", item);
          return item;
        });
      // fetchFileContents(fileItems.value);
    });
}

const fetchFileContents = (entries) => {
  dbxAuth.checkAndRefreshAccessToken();
  entries.forEach((item) => {
    dbx
      .filesDownload({ path: item.path_lower })
      .then((response) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileContents.value[item.id] = e.target.result;
        };
        reader.readAsText(response.result.fileBlob);
      })
      .catch((error) => console.error(error));
  });
};

const selectFile = (file) => {
  const { loadEntriesFromString } = useLoadedEntries();
  dbxAuth.checkAndRefreshAccessToken();
  dbx
    .filesDownload({ path: file.path_lower })
    .then((response) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target.result;
        // load the file entries content
        loadEntriesFromString(fileData);
        // set the loadedFile
        loadedFile.value = { path: file.path_lower };
      };
      reader.readAsText(response.result.fileBlob);
    })
    .catch((error) => console.error(error));
};

const unselectFile = () => {
  loadedFile.value = undefined;
  loadEntries([]);
}

const clearDbxSession = () => {
  console.log("clearDbxSession");
  window.sessionStorage.removeItem("accessToken");
  window.sessionStorage.removeItem("codeVerifier");
  dbxAuthCode.value = undefined;
  accessToken = undefined;
  fileItems.value = [];
  fileContents.value = {};
  loadedFile.value = undefined;
  loadEntriesFromString();
};
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <p>
      To load files from your DropBox account, you need to connect to DropBox
      and authorize Flogger.
    </p>
    <div
      id="pre-auth-section"
      :style="{ display: accessToken ? 'none' : 'block' }"
    >
      <button @click="doAuth">connect to DropBox</button>
    </div>
    
    <div
      id="authed-section"
      :style="{ display: (accessToken) ? 'block' : 'none' }"
    >
      <p>
        You are connected to DropBox.
      </p>
      <button @click="clearDbxSession">forget DropBox connection</button>
    </div>

    <div
      id="files-section"
      :style="{ display: !loadedFile ? 'block' : 'none' }"
    >
      <p>
        Below are the .flogger files available in your of the App/flogger folder.
      </p>
      <ul id="files">
        <li v-for="item in fileItems">
          <a href="#" @click.prevent="() => selectFile(item)">{{
            item.path_display
          }}</a>
        </li>
      </ul>
    </div>

    <div
      id="loadedFile-section"
      :style="{ display: loadedFile ? 'block' : 'none' }"
    >
      <p>
        The loaded file is <b>{{loadedFile?.path}}</b>
      </p>
      <button @click="unselectFile">close file</button>
    </div>
</section>
</template>

<style scoped>
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
