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
const fileItemContents = ref({});

if (hasRedirectedFromAuth.value) {
  console.log(`dbxAuthReturnUri`, dbxAuthReturnUri);
  console.log(`dbxAuthCode`, dbxAuthCode.value);

  const codeVerifier = window.sessionStorage.getItem("codeVerifier");
  console.log(`codeVerifier:`, codeVerifier);
  dbxAuth.setCodeVerifier(codeVerifier);
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
  // Unclear if there's a scenario where the accessToken would already be set in the dbxAuth object
  // } else {
  //   console.log("step 3b check from dbxAuth");
  //   window.sessionStorage.removeItem("accessToken");
  //   accessToken = dbxAuth.getAccessToken();
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
      // 7. Get file thumbnails
      dbxAuth.checkAndRefreshAccessToken();
      dbx
        .filesGetThumbnailBatch({
          entries: fileItems.value.map((item) => {
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
        });

      // // 8. At the same time we can query for file contents
      // fileItems.value.forEach(getFileContents);
    });
}

const getFileContents = (file, index) => {
  console.log("getFileContents", file, index);
  // only get contents if it's a file that ends with '.json'
  if (file[".tag"] == "file") {
    dbxAuth.checkAndRefreshAccessToken();
    dbx
      .filesGetTemporaryLink({
        /**
         * The path to the file you want a temporary link to.
         */
        path: file.path_lower,
      })
      .then(async (response) => {
        console.log(`Got link ${index}`, response);
        if (response?.result?.metadata?.id == file.id) {
          console.log(`Fetching file content ${index}`);
          const link = response.result.link;
          fileItemContents.value[file.id] = {
            link: link,
            content: undefined, // To be fetched
          };
          const contentStream = await fetch(link);
          // Returns an object with body property that is a ReadableStream
          // See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
          console.log(`contentStream ${index}`, contentStream);
          return new Response(contentStream.body, {
            headers: contentStream.headers,
          }).text();
        }
      })
      .then((content) => {
        console.log(`Got content ${index}`, content);
        fileItemContents.value[file.id] = {
          ...fileItemContents.value[file.id],
          content: content,
        };
      })
      .catch((e) => {
        console.log("Error getting file content URL:", e.error || e);
      });
  }
};

const clearDbxSession = () => {
  console.log("clearDbxSession");
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
      <ul id="files">
        <li v-for="file in fileItems">
          <b>{{ file.path_display }}</b>
          <ul class="files">
            <li>type (".tag"): {{ file[".tag"] }}</li>
            <li v-if="file.name.endsWith('.json')">
              name:
              <a @click="() => getFileContents(file)">{{ file.name }}</a>
            </li>
            <li v-else>name: {{ file.name }}</li>
            <!--   if (file[".tag"] == "file" && file?.name.endsWith(".json")) { -->
            <li>path_display: {{ file.path_display }}</li>
            <li>path_lower: {{ file.path_lower }}</li>
            <li>id: {{ file.id }}</li>
            <li v-if="fileItemThumbnails[file.id]">
              <img
                :src="'data:image/jpeg;base64,' + fileItemThumbnails[file.id]"
              />
            </li>
            <li v-if="fileItemContents[file.id]">
              <textarea>{{ fileItemContents[file.id].content }}</textarea>
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
