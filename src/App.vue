<template>
  <div>
    <h1>FLogger!</h1>
  </div>
  <button @click.prevent.stop="getTheFile()">open</button>
  <div class="m-3 p-3 border rounded-md">
    <div class="float-left mr-4 font-bold">dataFile:</div>
    <div>
      {{ dataFile ? dataFile.name : "no data file" }}
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
      {{ dataFileText ? dataFileText : "no data file text" }}
    </div>
  </div>
  <AddNote @newNote="addNewNote" :timestamp="timestamp" />
  <NoteList :notes="testNotes" />
</template>

<script>
import NoteList from "./components/NoteList.vue";
import AddNote from "./components/AddNote.vue";

export default {
  components: {
    NoteList,
    AddNote,
  },

  data() {
    return {
      timestamp: new Date().toLocaleDateString(),
      testNotes: [
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
      ],
      dataFile: undefined,
      dataFileText: undefined,
      dataFileLoaded: false,
    };
  },
  computed: {
  },
  methods: {
    addNewNote(noteData) {
      this.testNotes.push({
        timestamp: Date(noteData.timestamp),
        tags: noteData.tags.split(" "),
        message: noteData.entry,
      });
    },
    async getTheFileText() {
      let fileText = undefined;
      if (this.dataFileLoaded) fileText = await this.dataFile.name;
      return fileText;
    },
    async getTheFile() {
      const pickerOpts = {
        types: [
          {
            description: "Text",
            accept: {
              "text/*": [".txt", ".text", ".data"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };

      // Open file picker and destructure the result the first handle
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);

      // get file contents
      fileHandle.getFile().then((f) => {
        this.dataFile = f;
        this.dataFileLoaded = true;
        console.log(`dataFile loaded: `, this.dataFile);
        this.dataFile.text().then(t=>{
          this.dataFileText = t;
          console.log(`dataFileText loaded: `, this.dataFileText);
        });
      });
    },
  },
};
</script>

<style scoped></style>
