import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

// ************************************************************
// This section includes data vars and method functions for
// implementing File System Access API using showOpenFilePicker
// + Indexed DB to store FileHandle across page reloads
// Not supported in many browsers, see
// https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker#browser_compatibility
// But might be the only option to store data in a file on the
// user's system, and not require that they reopen the file on
// every visit and every page load. (However, does require they
// click a button to re-grant permission to the file.)

export const useDataFile = (dataLoadedCallback) => {
  const v2_fileHandle = ref({});
  const v2_filePermissions = ref("");
  const v2_fileOptions = { mode: "readwrite" };
  // store file name in localStorage so we can use it to
  // retrieve the file handle from indexedDB after page reload
  const v2_fileName = useLocalStorage("v2_fileName", null);
  const v2_fileDataStr = ref("");
  // Open a db instance to save file references for later sessions
  let v2_db;
  let v2_dbRequest = indexedDB.open("v2_db");
  v2_dbRequest.onerror = function (e) {
    console.error("Error opening database.", e);
  };
  v2_dbRequest.onsuccess = function (e) {
    v2_db = e.target.result;

    if (v2_fileName.value) v2_reloadFileFromDB(v2_fileName.value);
  };
  v2_dbRequest.onupgradeneeded = (event) => {
    v2_db = event.target.result;

    v2_db.onerror = (event) => {
      console.error("Error loading database.", event);
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
  console.log(`v2_db`, v2_db);

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
    let pickerSelection;
    try {
      pickerSelection = await window.showOpenFilePicker(pickerOpts);
    } catch (error) {
      console.log("Error picking file, probably user canceled:", error);
      return;
    }
    if (!pickerSelection) {
      console.log("no picker selection");
      return;
    }
    // get single file handler from possible array
    const [v2_fileHandle] = pickerSelection;
    return v2_fileHandle;
  }

  async function v2_clickToOpenFile() {
    // get file handle
    v2_fileHandle.value = await v2_getTheFileHandle();
    v2_fileCheckPermissions();
    console.log(`v2_fileHandle.value: `, v2_fileHandle.value);
    if (!v2_fileHandle.value) {
      console.log(`no file handle`);
      return;
    }
    v2_loadFile();

    // store the file handle in indexedDB to open the file later.
    let v2_dbTransaction = v2_db.transaction(["filerefs"], "readwrite");
    let v2_dbObjectStore = v2_dbTransaction.objectStore("filerefs");
    console.log(`indexNames`, v2_dbObjectStore.indexNames);
    console.log(`keyPath`, v2_dbObjectStore.keyPath);
    console.log(`name`, v2_dbObjectStore.name);
    console.log(`transaction`, v2_dbObjectStore.transaction);
    console.log(`autoIncrement`, v2_dbObjectStore.autoIncrement);
    let v2_dbRequest = v2_dbObjectStore.add(
      v2_fileHandle.value,
      v2_fileName.value
    );
    v2_dbRequest.onsuccess = function (e) {
      console.log(e);
    };
  }

  async function v2_saveFileData(fileDataObj) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await v2_fileHandle.value.createWritable();

    // Write the contents of the file to the stream.
    await writable.write(JSON.stringify(fileDataObj));

    // Close the file and write the contents to disk.
    await writable.close();
  }

  function v2_fileClose() {
    v2_fileHandle.value = undefined;
    v2_filePermissions.value = "";
    v2_fileName.value = "";
    v2_fileDataStr.value = "";
  }

  async function v2_fileCheckPermissions() {
    v2_filePermissions.value = await v2_fileHandle.value.queryPermission(
      v2_fileOptions
    );
    console.log(`v2_filePermissions`, v2_filePermissions);
  }

  async function v2_fileRequestPermission() {
    v2_filePermissions.value = await v2_fileHandle.value.requestPermission(
      v2_fileOptions
    );
    if (v2_filePermissions.value != "granted") {
      console.log(`access request failed`);
      return;
    }
    console.log(`access request granted`);
    v2_loadFile();
  }

  async function v2_loadFile() {
    try {
      // get file
      let v2_file = await v2_fileHandle.value.getFile();
      // get file name
      v2_fileName.value = v2_file.name;
      // get file contents
      v2_fileDataStr.value = await v2_file.text();
      // parse file contents
      let v2_fileDataObj = JSON.parse(v2_fileDataStr.value);
      console.log(`v2_fileDataObj`, v2_fileDataObj);
      dataLoadedCallback(v2_fileDataObj);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async function v2_reloadFileFromDB(file_id) {
    // Retrieve a file you've opened before. Show's no filepicker UI, but can show
    // some other permission prompt if the browser so desires.
    // The browser can choose when to allow or not allow this open.
    console.log(`v2_db`, v2_db);
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
        return;
      }

      // Permissions for the handle may have expired while the handle was stored
      // in IndexedDB. Before it is safe to use the handle we should request at
      // least read access to the handle again.
      v2_fileCheckPermissions();

      // // Rejects if file is no longer readable, either because it doesn't exist
      // // anymore or because the website no longer has permission to read it.
      // let file = await v2_fileHandle.value.file();
      // // ... read from file

      // // Rejects if file is no longer writable, because the website no longer has
      // // permission to write to it.
      // let file_writer = await v2_fileHandle.value.createWritable();
      // // ... write to file_writer

      if (v2_filePermissions == "granted") v2_loadFile();
    };
  }

  return {
    v2_fileName,
    v2_filePermissions,
    v2_clickToOpenFile,
    v2_fileRequestPermission,
    v2_saveFileData,
    v2_fileClose,
  };
};
