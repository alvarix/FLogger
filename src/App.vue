<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <UserAuth/>
  <!-- <section class="container main">
    <p>This example shows how to use PKCE in the browser</p>
    <div id="pre-auth-section" style="display: none">
      <button onClick="doAuth()">Start PKCE Auth Flow</button>

      <p class="info">
        Once authenticated, it will use the access token to list the files in
        your root directory.
      </p>
    </div>

    <div id="authed-section" style="display: none">
      <p>
        You have successfully authenticated. Below are the contents of your root
        directory. They were fetched using the SDK and access token.
      </p>
      <ul id="files"></ul>
    </div>
  </section> -->
  <div class="m-3 p-5 border rounded-lg w-full">
    <h2>Data file</h2>
    <div v-if="dataFileName" class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileName:</div>
      <div>
        {{ dataFileName }}
      </div>
      <div class="float-left mr-4 font-bold">dataFilePermissions:</div>
      <div>
        {{ dataFilePermissions }}
      </div>
      <div>
        <button @click="closeDataFile">close file</button>
      </div>
    </div>
    <div
      v-if="dataFilePermissions == 'prompt'"
      class="m-3 p-3 border border-red-700 rounded-md"
    >
      <div class="float-left mr-4 font-bold">File activation required:</div>
      <div>
        <button @click="dataFileClickToRequestPermission">grant access</button>
      </div>
    </div>
    <div
      v-else-if="!['prompt', 'granted'].includes(dataFilePermissions)"
      class="m-3 p-3"
    >
      <!-- <div class="float-left mr-4 font-bold">v2_fileHandle picker:</div> -->
      <div>
        <button ref="fh" @click="dataFileClickToOpen">
          select a data file
        </button>
      </div>
    </div>
    <!-- <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v2_fileDataStr:</div>
      <div>
        {{ v2_fileDataStr }}
      </div>
    </div> -->
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script setup>
import { ref } from "vue";
import { useDataFile } from "./modules/useDataFile.js";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";
import UserAuth from "./components/UserAuth.vue";

const {
  dataFileName,
  dataFilePermissions,
  dataFileClickToOpen,
  dataFileClickToRequestPermission,
  dataFileSave,
  dataFileClose,
} = useDataFile(loadData);
// That above is called a destructure assignment.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
// It is shorthand for this:
//   const dataFile = useDataFile(loadData);
//   const dataFileName = dataFile.dataFileName;
//   const dataFilePermissions = dataFile.dataFilePermissions;
//   const dataFileClickToOpen = dataFile.dataFileClickToOpen;
//   const dataFileClickToRequestPermission = dataFile.dataFileClickToRequestPermission;
//   const dataFileSave = dataFile.dataFileSave;
//   const dataFileClose = dataFile.dataFileClose;

// // COMPOSITION API: Doesn't use export default
// export default {

// // COMPOSITION API: Doesn't need the imported components declared
//   components: {
//     NoteList,
//     AddNote,
//   },

// // COMPOSITION API: Reactive data are created using ref()
//   data() {
//     return {
//       timestamp: new Date().toLocaleDateString(),
//       testNotes: [
//       {
//           timestamp: new Date("7/6/2023").toLocaleDateString(),
//           tags: ["tag 1", "tag 2"],
//           message: "This is the note body message.",
//         },
//        // {
//          // timestamp: new Date(),
//           //tags: ["tag 1", "tag 3"],
//           //message: "This is the note TWO body message.",
//         //},
//       ],
//     };
//   },
const timestamp = ref(new Date());

const testNotes = ref([
  // {
  //   timestamp: new Date("7/6/2023").toLocaleDateString(),
  //   tags: ["tag 1", "tag 2"],
  //   message: "This is the note body message.",
  // },
  // {
  // timestamp: new Date(),
  //tags: ["tag 1", "tag 3"],
  //message: "This is the note TWO body message.",
  //},
]);

// // COMPOSITION API: Methods are declared as normal-looking functions.
//   methods: {
// 		addNewNote(noteData) {
// 			this.testNotes.push ({
// 				timestamp: Date(noteData.timestamp),
// 				tags: noteData.tags.split(" "),
// 				message: noteData.entry
// 			});
// 		}
//   },
function addNewNote(noteData) {
  // // COMPOSITION API: "this." isn't necessary to reference reactive state vars, but ".value" is
  testNotes.value.push({
    timestamp: Date(noteData.timestamp),
    tags: noteData.tags.split(" "),
    message: noteData.entry,
  });
  dataFileSave({ notes: testNotes.value });
}

function closeDataFile() {
  dataFileClose();
  testNotes.value = [];
}

function loadData(dataFileObject) {
  if (dataFileObject?.notes) {
    testNotes.value = dataFileObject.notes;
  }
}

// // COMPOSITION API: Doesn't use export default
// };

// // DROPBOX

// // Standalone example to demonstrate codeflow.
// // Start the server, hit localhost:3000 on the browser, and click through.
// // On the server logs, you should have the auth code, as well as the token
// // from exchanging it. This exchange is invisible to the app user

// // const fetch = require('node-fetch');
// import fetch from "isomorphic-fetch";
// // const app = require('express')();

// const hostname = "localhost";
// const port = 5123;

// const config = {
//   fetch,
//   clientId: "q5qja4ma5qcl0qc", //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x
// };

// // const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
// import { Dropbox } from "dropbox";

// console.log('1')
// const dbx = new Dropbox(config);

// const redirectUri = `http://${hostname}:${port}/auth`;

// console.log('2')
// const dbxAuthUri = await dbx.auth.getAuthenticationUrl(
//   redirectUri,
//   null,
//   "code",
//   "offline",
//   null,
//   "none",
//   true
// );
// // .then((authUrl) => {
// //   res.writeHead(302, { Location: authUrl });
// //   res.end();
// // });

// console.log('3')

// function doAuth() {
//   response.redirectUri = dbxAuthUri;
// }

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
</script>

<style scoped>
h2 {
  font-size: 2em;
}
</style>
