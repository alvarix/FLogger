<script>
// DROPBOX

// Standalone example to demonstrate codeflow.
// Start the server, hit localhost:3000 on the browser, and click through.
// On the server logs, you should have the auth code, as well as the token
// from exchanging it. This exchange is invisible to the app user

// const fetch = require('node-fetch');
import fetch from "isomorphic-fetch";
// const app = require('express')();
import qs from "qs";

const hostname = "localhost";
const port = 5173;

const config = {
  fetch,
  clientId: "q5qja4ma5qcl0qc", //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x
};

// const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
import { Dropbox } from "dropbox";

console.log("1");
const dbx = new Dropbox(config);

const redirectUri = `http://${hostname}:${port}/`;

console.log("2");
const dbxAuthUri = await dbx.auth.getAuthenticationUrl(
  redirectUri,
  null,
  "code",
  "offline",
  null,
  "none",
  true
);
// .then((authUrl) => {
//   res.writeHead(302, { Location: authUrl });
//   res.end();
// });

console.log("3");

// app.get("/auth", (req, res) => {
//   // eslint-disable-line no-unused-vars
//   const { code } = req.query;
//   console.log(`code:${code}`);

//   dbx.auth
//     .getAccessTokenFromCode(redirectUri, code)
//     .then((token) => {
//       console.log(`Token Result:${JSON.stringify(token)}`);
//       dbx.auth.setRefreshToken(token.result.refresh_token);
//       dbx
//         .usersGetCurrentAccount()
//         .then((response) => {
//           console.log("response", response);
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
//   res.end();
// });

// app.listen(port);

// // CLIENTSIDE VERSION

// var REDIRECT_URI =
//   "http://localhost:5173/public/javascript/pkce-browser/index.html";
// var CLIENT_ID = "q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x
// var dbxAuth = new dbx.DropboxAuth({
//   clientId: CLIENT_ID,
// });

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
// function hasRedirectedFromAuth() {
//   return !!getCodeFromUrl();
// }

const hasRedirectedFromAuth = ref(!!getCodeFromUrl());

// // Render a list of items to #files
// function renderItems(items) {
//   var filesContainer = document.getElementById("files");
//   items.forEach(function (item) {
//     var li = document.createElement("li");
//     li.innerHTML = item.name + ":" + item.REDIRECT_URI;
//     filesContainer.appendChild(li);
//   });
// }

// This example keeps both the authenticated and non-authenticated setions
// in the DOM and uses this function to show/hide the correct section.
function showPageSection(elementId) {
  console.log(
    `showPageSection: ${elementId} = ${document.getElementById(elementId)}`,
    `style.display = ${document.getElementById(elementId)?.style?.display}`
  );
  if (document.getElementById(elementId))
    document.getElementById(elementId).style.display = "block";
  console.log(
    `showPageSection: ${elementId} = ${document.getElementById(elementId)}`,
    `style.display = ${document.getElementById(elementId)?.style?.display}`
  );
}

// function doAuth() {
//   dbxAuth
//     .getAuthenticationUrl(
//       REDIRECT_URI,
//       undefined,
//       "code",
//       "offline",
//       undefined,
//       undefined,
//       true
//     )
//     .then((authUrl) => {
//       window.sessionStorage.clear();
//       window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
//       window.location.href = authUrl;
//     })
//     .catch((error) => console.error(error));
// }

if (hasRedirectedFromAuth) {
  //   //   showPageSection("authed-section");
  //   dbxAuth.setCodeVerifier(window.sessionStorage.getItem("codeVerifier"));
  //   dbxAuth
  //     .getAccessTokenFromCode(REDIRECT_URI, getCodeFromUrl())
  //     .then((response) => {
  //       dbxAuth.setAccessToken(response.result.access_token);
  //       var dbx = new Dropbox.Dropbox({
  //         auth: dbxAuth,
  //       });
  //       return dbx.filesListFolder({
  //         path: "",
  //       });
  //     })
  //     .then((response) => {
  //       renderItems(response.result.entries);
  //     })
  //     .catch((error) => {
  //       console.error(error.error || error);
  //     });
  // } else {
  //   showPageSection("pre-auth-section");
}

import { ref } from "vue";

export default {
  name: "UserAuth",
  components: {},
  props: {
    timestamp: Date,
  },
  // emits: ['userAuthed'],
  data() {
    return {
      hasError: false,
      form: {
        timestampValue: this.timestamp,
        tags: "",
        entry: "",
      },
    };
  },
  methods: {
    doAuth: () => {
      console.log("doAuth");
      window.location.href = dbxAuthUri;
    },
    // Parses the url and gets the access token if it is in the urls hash
    getCodeFromUrl() {
      //   return utils.parseQueryString(window.location.search).code;
      //   const code = qs.parse(window.location.search)?.code;
      //   console.log(`window.location.search: ${window.location.search}`);
      //   console.log(`qs.parse(window.location.search):`, qs.parse(window.location.search));
      //   console.log(`getCodeFromUrl: ${code}`);
      //   qs.parse(window.location.search,{})
      const query = window.location.search.split("&");
      const code = query[0].split("=")[1];
      console.log(`getCodeFromUrl: ${code}`);
      return code;
    },
  },
};
</script>

<template>
  <!-- Example description and UI -->
  <section class="container main">
    <p>
      This example shows how to use PKCE in the browser:
      {{ this.hasRedirectedFromAuth }} = {{ this.getCodeFromUrl() }}
    </p>
    <div
      id="pre-auth-section"
      :style="{ display: this.hasRedirectedFromAuth ? 'none' : 'block' }"
    >
      <button @click="doAuth">Start PKCE Auth Flow</button>

      <p class="info">
        Once authenticated, it will use the access token to list the files in
        your root directory.
      </p>
    </div>

    <div
      id="authed-section"
      :style="{ display: this.hasRedirectedFromAuth ? 'block' : 'none' }"
    >
      <p>
        You have successfully authenticated. Below are the contents of your root
        directory. They were fetched using the SDK and access token.
      </p>
      <ul id="files"></ul>
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
