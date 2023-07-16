<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <div>
    <div flex="~ gap-1" items-center>
      <button @click="onOpen">
        Open
      </button>
      <button @click="res.create()">
        New file
      </button>
      <button :disabled="!res.file.value" @click="onSave">
        Save
      </button>
      <button :disabled="!res.file.value" @click="res.saveAs()">
        Save as
      </button>

      <div ml5>
        <div text-xs op50>
          DataType
        </div>
        <select v-model="dataType" class="outline-none w-30 px2 py1 text-sm" border="~ main rounded">
          <option value="Text">
            Text
          </option>
          <option value="ArrayBuffer">
            ArrayBuffer
          </option>
          <option value="Blob">
            Blob
          </option>
        </select>
      </div>
    </div>

    <pre class="code-block" lang="yaml">{{ str }}</pre>

    <div v-if="content">
      Content
      <textarea
        v-if="typeof content === 'string'"
        v-model="content" rows="20" cols="40" w-full
      />
      <span v-else>{{ content }}</span>
    </div>
  </div>
  <div class="p-5">
    <hr />
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">testVar:</div>
      <div>
        <input v-model="testVar" />
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">testFileHandle picker:</div>
      <div>
        <button ref="fh" @click="clickToGetTheFileHandle">picker</button>
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">testFileHandle:</div>
      <div>
        {{ testFileHandle }}
      </div>
    </div>
  </div>
  <div class="p-5">
    <hr />
    <input
      id="filesInput"
      ref="filesInput"
      type="file"
      accept="text/*"
      @change="getTheFile"
    />
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">testFile:</div>
      <div>
        {{
          testFile
            ? testFile.webkitRelativePath + " / " + testFile.name
            : "no data file"
        }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFile:</div>
      <div>
        {{
          dataFile
            ? dataFile.webkitRelativePath + " / " + dataFile.name
            : "no data file"
        }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFile:</div>
      <div>
        {{ JSON.stringify(dataFile) }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileLoaded:</div>
      <div>
        {{ dataFileLoaded }}
      </div>
    </div>
    <div class="m-3 p-3 border rounded-md">
      <div class="float-left mr-4 font-bold">dataFileText:</div>
      <div>
        ?
        {{ dataFileText }}
      </div>
    </div>
    <hr />
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
import { reactify } from '@vueuse/core'
import { useFileSystemAccess } from '@vueuse/core'

const stringify = reactify(JSON.stringify)

const dataType = ref('Text');// as Ref<'Text' | 'ArrayBuffer' | 'Blob'>
const res = useFileSystemAccess({
  dataType,
  types: [{
    description: 'text',
    accept: {
      'text/plain': ['.txt', '.html'],
    },
  }],
  excludeAcceptAllOption: true,
})

const content = res.data
const str = stringify(reactive({
  isSupported: res.isSupported,
  file: res.file,
  fileName: res.fileName,
  fileMIME: res.fileMIME,
  fileSize: res.fileSize,
  fileLastModified: res.fileLastModified,
}))

async function onOpen() {
  console.log(`res1 `,res)
  await res.open()
  console.log(`res2 `,res)
}
async function onSave() {
  await res.save()
}

const testVar = useLocalStorage("testVar", "default");
let testFile = useLocalStorage("testFile", {});
let testFileHandle = useLocalStorage("testFileHandle", {});

const dataFileStore = useDataFileStore();
// dataFileStore.file // <-- This will be used to save the location of the dataFile

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

// New refs and functions for dataFile
const dataFile = computed(() => dataFileStore.file);
const dataFileText = computed(() => {
  let text = "";
  console.log(`dataFileStore.file?.text: `, dataFileStore.file?.text);
  if (dataFileStore.file.text)
    dataFileStore.file.text().then((t) => {
      console.log(`dataFileStore.file.text t = `, t);
      text = t;
      console.log(`dataFileText loaded: `, text);
    });
  return text;
});
const dataFileLoaded = ref(false);

function getTheFile(event) {
  console.log(`getTheFile: `, event.target.files);
  for (const file of event.target.files) {
    dataFileStore.file = file; // <-- This will be used to save the location of the dataFile
    testFile = file;
    dataFileLoaded.value = true;
  }
}

async function clickToGetTheFileHandle() {
  testFileHandle = useLocalStorage("testFileHandle", await getTheFileHandle());
  console.log(`testFileHandle: `, testFileHandle)
  // // get file contents
  // const fileData = await fileHandle.getFile();
  // return fileData;
}

async function getTheFileHandle() {
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
  const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  return fileHandle;
  // // get file contents
  // const fileData = await fileHandle.getFile();
  // return fileData;
}

onMounted(() => {
  console.log(`dataFileStore`, dataFileStore);
  console.log(`dataFileStore.file`, dataFileStore.file);
  console.log(`dataFileText`, dataFileText.value);
});
</script>

<style scoped></style>
