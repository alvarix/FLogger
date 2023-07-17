<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <div class="m-3 p-5 border rounded-lg">
    <div class="m-3 p-3 border rounded-md">
      <h2>Version 3</h2>
    </div>
    <div class="m-3 p-3 border rounded-md" style="flex: ~gap-1">
      <button @click="v3_onOpen">Open</button>
      <button @click="v3_useFSAref.create()">New file</button>
      <button :disabled="!v3_useFSAref.file.value" @click="v3_onSave">
        Save
      </button>
      <button
        :disabled="!v3_useFSAref.file.value"
        @click="v3_useFSAref.saveAs()"
      >
        Save as
      </button>

      <div class="m-3 p-3 border rounded-md">
        <div>DataType</div>
        <select v-model="v3_dataType" class="m-3 p-3 border rounded-md">
          <option value="Text">Text</option>
          <option value="ArrayBuffer">ArrayBuffer</option>
          <option value="Blob">Blob</option>
        </select>
      </div>
    </div>

    <div class="m-3 p-3 border rounded-md">
      <pre class="code-block" lang="json">{{ v3_str }}</pre>
    </div>

    <div v-if="v3_content" class="m-3 p-3 border rounded-md">
      Content
      <textarea
        v-if="typeof v3_content === 'string'"
        v-model="v3_content"
        cols="40"
        class="m-3 p-3 border rounded-md"
      />
      <div v-else class="m-3 p-3 border rounded-md">{{ v3_content }}</div>
    </div>
  </div>
  <div class="m-3 p-5 border rounded-lg">
    <div class="m-3 p-3 border rounded-md">
      <h2>useLocalSession test</h2>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">useLocalSessionTest:</div>
      <div>
        <input v-model="useLocalSessionTest" />
      </div>
    </div>
  </div>
  <div class="m-3 p-5 border rounded-lg">
    <div class="m-3 p-3 border rounded-md">
      <h2>Version 2</h2>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v2_fileHandle picker:</div>
      <div>
        <button ref="fh" @click="v2_clickToGetTheFileHandle">picker</button>
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v2_fileHandle:</div>
      <div>
        {{ v2_fileHandle }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v2_fileText:</div>
      <div>
        {{ v2_fileText }}
      </div>
    </div>
  </div>
  <div class="m-3 p-5 border rounded-lg">
    <div class="m-3 p-3 border rounded-md">
      <h2>Version 1</h2>
    </div>
    <input
      id="filesInput"
      ref="filesInput"
      type="file"
      accept="text/*"
      @change="v1_getTheFile"
    />
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v1_fileData_uLS:</div>
      <div>
        {{
          v1_fileData_uLS
            ? v1_fileData_uLS.webkitRelativePath + " / " + v1_fileData_uLS.name
            : "no data file"
        }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v1_file:</div>
      <div>
        {{
          v1_file
            ? v1_file.webkitRelativePath + " / " + v1_file.name
            : "no data file"
        }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v1_file:</div>
      <div>
        {{ JSON.stringify(v1_file) }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v1_fileLoaded:</div>
      <div>
        {{ v1_fileLoaded }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">v1_fileText:</div>
      <div>
        ?
        {{ v1_fileText }}
      </div>
    </div>
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useDataFileStore } from "./stores/dataFile";
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";
import { useLocalStorage } from "@vueuse/core";
import { reactify } from "@vueuse/core";
import { useFileSystemAccess } from "@vueuse/core";

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
const timestamp = ref(new Date().toLocaleDateString());

const testNotes = ref([
  {
    timestamp: new Date("7/6/2023").toLocaleDateString(),
    tags: ["tag 1", "tag 2"],
    message: "This is the note body message.",
  },
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
}

// // COMPOSITION API: Doesn't use export default
// };

// ************************************************************
// VERSION 3 — useFileSystemAccess

const v3_stringify = reactify(JSON.stringify);

const v3_dataType = ref("Text"); // as Ref<'Text' | 'ArrayBuffer' | 'Blob'>
const v3_useFSAref = useFileSystemAccess({
  v3_dataType,
  types: [
    {
      description: "text",
      accept: {
        "text/plain": [".txt", ".html"],
      },
    },
  ],
  excludeAcceptAllOption: true,
});

const v3_content = v3_useFSAref.data;
const v3_str = v3_stringify(
  reactive({
    isSupported: v3_useFSAref.isSupported,
    file: v3_useFSAref.file,
    fileName: v3_useFSAref.fileName,
    fileMIME: v3_useFSAref.fileMIME,
    fileSize: v3_useFSAref.fileSize,
    fileLastModified: v3_useFSAref.fileLastModified,
  })
);

async function v3_onOpen() {
  console.log(`res1 `, v3_useFSAref);
  await v3_useFSAref.open();
  console.log(`res2 `, v3_useFSAref);
}
async function v3_onSave() {
  await v3_useFSAref.save();
}

// ************************************************************
// useLocalSession test

const useLocalSessionTest = useLocalStorage("useLocalSessionTest", "default");

// ************************************************************
// VERSION 2 — showOpenFilePicker + Indexed DB

const v2_fileHandle = ref({});
const v2_fileText = ref("");
// Open a db instance to save file references for later sessions
let v2_db;
let v2_dbRequest = indexedDB.open("v2_db");
v2_dbRequest.onerror = function (e) {
  console.log(e);
};
v2_dbRequest.onsuccess = function (e) {
  v2_db = e.target.result;

  v2_reloadFileFromDB();

};
v2_dbRequest.onupgradeneeded = (event) => {
  v2_db = event.target.result;

  v2_db.onerror = (event) => {
    console.log("Error loading database.", event);
  };

  // Create an objectStore for this database
  const v2_objectStore = v2_db.createObjectStore(
    "filerefs"
    // , {
    //   keyPath: "file_id",
    // }
  );

  // Define what data items the objectStore will contain
  // v2_objectStore.createIndex("hours", "hours", { unique: false });
  // v2_objectStore.createIndex("minutes", "minutes", { unique: false });
  // v2_objectStore.createIndex("day", "day", { unique: false });
  // v2_objectStore.createIndex("month", "month", { unique: false });
  // v2_objectStore.createIndex("year", "year", { unique: false });
  // v2_objectStore.createIndex("notified", "notified", { unique: false });

  console.log("Object store created.");
};
console.log(`v2_db`,v2_db);


async function v2_clickToGetTheFileHandle() {
  v2_fileHandle.value = await v2_getTheFileHandle();
  console.log(`v2_fileHandle: `, v2_fileHandle);
  // get file contents
  let v2_file = await v2_fileHandle.value.getFile();
  v2_fileText.value = await v2_file.text();

  if (v2_fileHandle) {
    // Save the reference to open the file later.
    let v2_dbTransaction = v2_db.transaction(["filerefs"], "readwrite");
    let v2_dbObjectStore = v2_dbTransaction.objectStore("filerefs");
    console.log(`indexNames`, v2_dbObjectStore.indexNames);
    console.log(`keyPath`, v2_dbObjectStore.keyPath);
    console.log(`name`, v2_dbObjectStore.name);
    console.log(`transaction`, v2_dbObjectStore.transaction);
    console.log(`autoIncrement`, v2_dbObjectStore.autoIncrement);
    let v2_dbRequest = v2_dbObjectStore.add(v2_fileHandle.value, v2_file.name);
    v2_dbRequest.onsuccess = function (e) {
      console.log(e);
    };

    // Do other useful things with the opened file.
  }

  // ...
}

async function v2_getTheFileHandle() {
  const pickerOpts = {
    types: [
      {
        description: "Text",
        accept: {
          "text/*": [".txt", ".text", ".json"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  // open file picker
  const [v2_fileHandle] = await window.showOpenFilePicker(pickerOpts);

  return v2_fileHandle;
  // // get file contents
  // const fileData = await v2_fileHandle.getFile();
  // return fileData;
}

async function v2_reloadFileFromDB() {
  // Retrieve a file you've opened before. Show's no filepicker UI, but can show
  // some other permission prompt if the browser so desires.
  // The browser can choose when to allow or not allow this open.
  let file_id = "notes data.txt"; // Some logic to determine which file you'd like to open
  console.log(`v2_db`,v2_db);
  let v2_dbTransaction = v2_db.transaction(["filerefs"], "readonly");
  let v2_dbObjectStore = v2_dbTransaction.objectStore("filerefs");
  console.log(`indexNames`, v2_dbObjectStore.indexNames);
  console.log(`keyPath`, v2_dbObjectStore.keyPath);
  console.log(`name`, v2_dbObjectStore.name);
  console.log(`transaction`, v2_dbObjectStore.transaction);
  console.log(`autoIncrement`, v2_dbObjectStore.autoIncrement);
  let v2_dbRequest = await v2_dbObjectStore.get(file_id);
  v2_dbRequest.onsuccess = async function (e) {
    v2_fileHandle.value = v2_dbRequest.result;
    console.log(`v2_fileHandle.value: `, v2_fileHandle.value);

    if (!v2_fileHandle.value) {
      console.log(`no result`);
      return
    }

    // Permissions for the handle may have expired while the handle was stored
    // in IndexedDB. Before it is safe to use the handle we should request at
    // least read access to the handle again.
    if ((await v2_fileHandle.value.queryPermission({mode:"readwrite"})) != "granted") {
      // No longer allowed to access the handle.
      console.log(`no access granted`);
      return;
    }

    // // Rejects if file is no longer readable, either because it doesn't exist
    // // anymore or because the website no longer has permission to read it.
    // let file = await v2_fileHandle.value.file();
    // // ... read from file

    // // Rejects if file is no longer writable, because the website no longer has
    // // permission to write to it.
    // let file_writer = await v2_fileHandle.value.createWritable();
    // // ... write to file_writer

    let v2_file = await v2_fileHandle.value.getFile();
    v2_fileText.value = await v2_file.text();
  };
}

// ************************************************************
// VERSION 1 — File input + Pinia

const v1_store = useDataFileStore();
// v1_store.file // <-- This will be used to save the location of the v1_file

// New refs and functions for v1_file
let v1_fileData_uLS = useLocalStorage("v1_fileData_uLS", {});
const v1_file = computed(() => v1_store.file);
const v1_fileText = computed(() => {
  let text = "";
  console.log(`v1_store.file?.text: `, v1_store.file?.text);
  if (v1_store.file.text)
    v1_store.file.text().then((t) => {
      console.log(`v1_store.file.text t = `, t);
      text = t;
      console.log(`v1_fileText loaded: `, text);
    });
  return text;
});
const v1_fileLoaded = ref(false);

function v1_getTheFile(event) {
  console.log(`v1_getTheFile: `, event.target.files);
  for (const file of event.target.files) {
    v1_store.file = file; // <-- This will be used to save the location of the v1_file
    v1_fileData_uLS = file;
    v1_fileLoaded.value = true;
  }
}

// ************************************************************

onMounted(() => {
  console.log(`v1_store`, v1_store);
  console.log(`v1_store.file`, v1_store.file);
  console.log(`v1_fileText`, v1_fileText.value);
});
</script>

<style scoped></style>
