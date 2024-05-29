<script setup>
import { ref } from "vue";
import fetch from "isomorphic-fetch";
import qs from "qs";

const props = defineProps({});

const hostname = "localhost";
const port = 5173;
var CLIENT_ID = "q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x

const config = {
  fetch,
  clientId: CLIENT_ID,
};

import { Dropbox, DropboxAuth } from "dropbox";

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
      window.sessionStorage.clear();
      window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
      window.location.href = authUrl;
    })
    .catch((error) => console.error(error));
};

// Parses the url and gets the access token if it is in the urls hash
const getDbxAuthCodeFromUrl = () => {
  //   return utils.parseQueryString(window.location.search).code;
  //   const code = qs.parse(window.location.search)?.code;
  //   console.log(`window.location.search: ${window.location.search}`);
  //   console.log(`qs.parse(window.location.search):`, qs.parse(window.location.search));
  //   console.log(`getDbxAuthCodeFromUrl: ${code}`);
  //   qs.parse(window.location.search,{})
  const query = window.location.search.split("&");
  const code = query[0].split("=")[1];
  //   console.log(`getDbxAuthCodeFromUrl: ${code}`);
  return code;
};

const dbxAuthCode = ref(getDbxAuthCodeFromUrl());
const hasRedirectedFromAuth = ref(!!dbxAuthCode.value);

const fileItems = ref([]);

if (hasRedirectedFromAuth.value) {
  console.log(`dbxAuthReturnUri`, dbxAuthReturnUri);
  console.log(`dbxAuthCode`, dbxAuthCode.value);

  const codeVerifier = window.sessionStorage.getItem("codeVerifier")
  console.log(`codeVerifier:`, codeVerifier)
  dbxAuth.setCodeVerifier(codeVerifier);
  console.log('step 1')
  dbxAuth
    // 1. Get token
    .getAccessTokenFromCode(dbxAuthReturnUri, dbxAuthCode)
    // 2. Use token to get files
    .then((response) => {
      console.log('step 2')
      dbxAuth.setAccessToken(response.result.access_token);
      console.log('step 3')
      var dbx = new Dropbox({
        auth: dbxAuth,
      });
      return dbx.filesListFolder({
        path: "",
      });
    })
    // 3. Set fileItems to display
    .then((response) => {
      console.log('step 4')
      fileItems.value = response.result.entries.map((item) => {
        return {
          name: item.name,
          itemUri: item.preview_url,
        };
      });
    })
    // .catch((error) => {
    //   console.error(error.error || error);
    // });
}
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <p>This example shows how to use PKCE in the browser:</p>
    <div
      id="pre-auth-section"
      :style="{ display: hasRedirectedFromAuth ? 'none' : 'block' }"
    >
      <button @click="doAuth">Start PKCE Auth Flow</button>

      <p class="info">
        Once authenticated, it will use the access token to list the files in
        your root directory.
      </p>
    </div>

    <div
      id="authed-section"
      :style="{ display: hasRedirectedFromAuth ? 'block' : 'none' }"
    >
      <p>
        You have successfully authenticated. Below are the contents of your root
        directory. They were fetched using the SDK and access token.
      </p>
      <ul id="files">
        <li v-for="item in fileItems">{{ item.name }} -- {{ item.itemUri }}</li>
      </ul>
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
</style>
