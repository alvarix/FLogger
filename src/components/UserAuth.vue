<script setup>
import { ref } from "vue";
import fetch from "isomorphic-fetch";
import qs from "qs";

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
const fileItemThumbnails = ref({});

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
      fileItems.value = response.result.entries.map((item) => {
        console.log("item", item);
        return item;
      });
      dbxAuth.checkAndRefreshAccessToken();
      dbx
        .filesGetThumbnailBatch({
          entries: response.result.entries.map((item) => {
            return {
              /**
               * The path to the image file you want to thumbnail.
               */
              path: item.path_lower,
              /**
               * Defaults to TagRef(Union('ThumbnailFormat', [UnionField('jpeg', Void,
               * False, None), UnionField('png', Void, False, None)]), 'jpeg').
               */
              // format?: ThumbnailFormat;
              /**
               * Defaults to TagRef(Union('ThumbnailSize', [UnionField('w32h32', Void,
               * False, None), UnionField('w64h64', Void, False, None),
               * UnionField('w128h128', Void, False, None), UnionField('w256h256', Void,
               * False, None), UnionField('w480h320', Void, False, None),
               * UnionField('w640h480', Void, False, None), UnionField('w960h640', Void,
               * False, None), UnionField('w1024h768', Void, False, None),
               * UnionField('w2048h1536', Void, False, None)]), 'w64h64').
               */
              // size?: ThumbnailSize;
              /**
               * Defaults to TagRef(Union('ThumbnailMode', [UnionField('strict', Void,
               * False, None), UnionField('bestfit', Void, False, None),
               * UnionField('fitone_bestfit', Void, False, None)]), 'strict').
               */
              // mode?: ThumbnailMode;
            };
          }),
        })
        .then((response) => {
          console.log("filesGetThumbnailBatch", response);
          response.result.entries.forEach((entry) => {
            if (entry[".tag"] == "success") {
              fileItemThumbnails.value[entry.metadata.id] = entry.thumbnail;
            }
          });
          return true;
        })
        .then(() => {
          dbxAuth.checkAndRefreshAccessToken();
          dbx.fileRequestsCreate;
        });
    });
}

const clearDbxSession = () => {
  console.log('clearDbxSession');
  window.sessionStorage.removeItem("accessToken");
  window.sessionStorage.removeItem("codeVerifier");
  dbxAuthCode.value = undefined;
  accessToken = undefined;
  fileItems.value = [];
  fileItemThumbnails.value = {};
};


</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <p>This example shows how to use PKCE in the browser:</p>
    <div
      id="pre-auth-section"
      :style="{ display: accessToken ? 'none' : 'block' }"
    >
      <button @click="doAuth">Start PKCE Auth Flow</button>

      <p class="info">
        Once authenticated, it will use the access token to list the files in
        your root directory.
      </p>
    </div>

    <div
      id="authed-section"
      :style="{ display: accessToken ? 'block' : 'none' }"
    >
      <p>
        You have successfully authenticated. Below are the contents of your root
        directory. They were fetched using the SDK and access token.
      </p>
      <div>{{ JSON.stringify(fileItemThumbnails.value) }}</div>
      <ul id="files">
        <li v-for="item in fileItems">
          <b>{{ item.path_display }}</b>
          <ul class="item">
            <li>type (".tag"): {{ item[".tag"] }}</li>
            <li>name: {{ item.name }}</li>
            <li>path_display: {{ item.path_display }}</li>
            <li>path_lower: {{ item.path_lower }}</li>
            <li>id: {{ item.id }}</li>
            <li v-if="fileItemThumbnails[item.id]">
              <img
                :src="'data:image/jpeg;base64,' + fileItemThumbnails[item.id]"
              />
            </li>
          </ul>
        </li>
      </ul>
      <button @click="clearDbxSession">clear</button>
    </div>
  </section>
</template>

<style scoped>
#add-note *:not(.date-validation) {
  display: block;
}

input.error {
  border: 1px solid red;
}

.date-validation.error {
  display: block;
  color: red;
}

#add-note label {
  margin-top: 20px;
}

ul {
  border-radius: 14px;
  list-style: disc;
  padding: 0.5em;
  margin: 0.5em;
}
</style>
