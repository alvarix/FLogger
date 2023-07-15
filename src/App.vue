<template>
  <div>
    <h1>FLogger!</h1>
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
    <hr />
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
  computed: {},
  methods: {
    addNewNote(noteData) {
      this.testNotes.push({
        timestamp: Date(noteData.timestamp),
        tags: noteData.tags.split(" "),
        message: noteData.entry,
      });
    },
    getTheFile(event) {
      console.log(`getTheFile: `, event.target.files);
      for (const file of event.target.files) {
        file.text().then((t) => {
          this.dataFileText = t;
          console.log(`dataFileText loaded: `, this.dataFileText);
        });
      }
    },
  },
};
</script>

<style scoped></style>
