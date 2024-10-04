import { ref, Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { IEntry } from "@/modules/EntryData";
import { deserializeEntries, IFlog } from "@/modules/Flog"

export interface IFloggerDataFileComposable {
    dataFileName: string;
    dataFilePermissions: string;
    dataFileSave: (fileDataObj: any) => void; // Should be fileDataObj: <SOME TYPE FOR FLOGGER FILE DATA>
    dataFileClose: () => void;
    // Not sure if there's a reason to make these public, or part of the Flogger interface anyway
    // launchOpenFileFlow: () => void;
    // launchRequestPermissionsFlow: () => void;
    // getFileHandleFromPicker: () => FileSystemFileHandle[] | undefined;
    // dataFileCheckPermissions: () => void; 
    // dataFileLoad: () => void // Sets state vars dataFileName, selectedFileFlog
    // dataFileReload: (file_id: string) => void;
}


interface IDataFileFlog extends IFloggerDataFileComposable {
    launchOpenFileFlow: () => void;
    launchRequestPermissionsFlow: () => void;
}

export interface IFileFlog extends IFlog {
}

export interface IFileFlogs {
    dataFilePermissions: Ref<string>;
    launchOpenFileFlow: () => void;
    launchRequestPermissionsFlow: () => void;
    selectedFileFlog: Ref<IFileFlog>;
    // dataFileName: Ref<string>;
    // loadFlogEntries: (flog: IFileFlog) => IEntry[]
    dataFileSave: (fileDataObj: any) => void; // Should be fileDataObj: <SOME TYPE FOR FLOGGER FILE DATA>
    dataFileClose: () => void;
}
// export interface IDropboxFlogs {
//     launchConnectFlow: () => void
//     hasConnection: Ref<boolean>
//     clearConnection: () => void
//     availableFlogs: Ref<IDropboxFlog[]>
//     loadFlogEntries: (flog: IDropboxFlog) => IDropboxFlog[]
// }

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

export const useLocalFileFlogs = (dataLoadedCallback): IFileFlogs => {
    const dataFileHandle = ref({});
    const dataFilePermissions = ref("");
    const dataFileOptions = { mode: "readwrite" };
    // store file name in localStorage so we can use it to
    // retrieve the file handle from indexedDB after page reload
    const dataFileName = useLocalStorage("dataFileName", null);
    const dataFileDataStr = ref("");
    const selectedFileFlog = ref<IFileFlog>()
    // Open a db instance to save file references for later sessions
    let dataFileDB;
    let dataFileDBRequest = indexedDB.open("dataFileDB");
    dataFileDBRequest.onerror = function (e) {
        console.error("Error opening database.", e);
    };
    dataFileDBRequest.onsuccess = function (e) {
        dataFileDB = e.target.result;

        if (dataFileName.value) dataFileReload(dataFileName.value);
    };
    dataFileDBRequest.onupgradeneeded = (event) => {
        dataFileDB = event.target.result;

        dataFileDB.onerror = (event) => {
            console.error("Error loading database.", event);
        };

        // Create an objectStore for this database
        const dataFileObjectStore = dataFileDB.createObjectStore(
            "filerefs"
            // , {
            //   keyPath: "file_id",
            // }
        );

        // Define what data items the objectStore will contain
        // dataFileObjectStore.createIndex("hours", "hours", { unique: false });
        // dataFileObjectStore.createIndex("minutes", "minutes", { unique: false });
        // dataFileObjectStore.createIndex("day", "day", { unique: false });
        // dataFileObjectStore.createIndex("month", "month", { unique: false });
        // dataFileObjectStore.createIndex("year", "year", { unique: false });
        // dataFileObjectStore.createIndex("notified", "notified", { unique: false });

        console.log("Object store created.");
    };
    console.log(`dataFileDB`, dataFileDB);

    async function getFileHandleFromPicker() {
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
        const [dataFileHandle] = pickerSelection;
        return dataFileHandle;
    }

    async function launchOpenFileFlow() {
        // get file handle
        dataFileHandle.value = await getFileHandleFromPicker();
        console.log(`dataFileHandle.value: `, dataFileHandle.value);
        if (!dataFileHandle.value) {
            console.log(`no file handle`);
            return;
        }
        await dataFileCheckPermissions();
        if (dataFilePermissions.value == "prompt") await launchRequestPermissionsFlow()

        if (dataFilePermissions.value == "granted") await dataFileLoad();
        else return
        // await dataFileLoad();

        console.log(`dataFileName.value: `, dataFileName.value);

        // store the file handle in indexedDB to open the file later.
        let dataFileDBTransaction = dataFileDB.transaction(
            ["filerefs"],
            "readwrite"
        );
        let dataFileDBObjectStore = dataFileDBTransaction.objectStore("filerefs");
        console.log(`indexNames`, dataFileDBObjectStore.indexNames);
        console.log(`keyPath`, dataFileDBObjectStore.keyPath);
        console.log(`name`, dataFileDBObjectStore.name);
        console.log(`transaction`, dataFileDBObjectStore.transaction);
        console.log(`autoIncrement`, dataFileDBObjectStore.autoIncrement);
        let dataFileDBRequest = dataFileDBObjectStore.add(
            dataFileHandle.value,
            dataFileName.value
        );
        dataFileDBRequest.onsuccess = function (e) {
            console.log(e);
        };
    }

    async function dataFileSave(fileDataObj) {
        // Create a FileSystemWritableFileStream to write to.
        const writable = await dataFileHandle.value.createWritable();

        // Write the contents of the file to the stream.
        await writable.write(JSON.stringify(fileDataObj));

        // Close the file and write the contents to disk.
        await writable.close();
    }

    function dataFileClose() {
        dataFileHandle.value = undefined;
        dataFilePermissions.value = "";
        dataFileName.value = "";
        dataFileDataStr.value = "";
    }

    async function dataFileCheckPermissions() {
        dataFilePermissions.value = await dataFileHandle.value.queryPermission(
            dataFileOptions
        );
        console.log("dataFilePermissions.value", dataFilePermissions.value);
    }

    async function launchRequestPermissionsFlow() {
        dataFilePermissions.value = await dataFileHandle.value.requestPermission(
            dataFileOptions
        );
        if (dataFilePermissions.value != "granted") {
            console.log(`access request failed`);
            return;
        }
        console.log(`access request granted`);
        await dataFileLoad();
    }

    async function dataFileLoad() {
        console.log(`dataFileLoad`);
        try {
            // get file
            let dataFile = await dataFileHandle.value.getFile();
            // get file name
            dataFileName.value = dataFile.name;
            // get file contents
            dataFileDataStr.value = await dataFile.text();
            // parse file contents
            selectedFileFlog.value = {
                url: '<strong>Local File:</strong> '+dataFileName.value,
                permissions: dataFilePermissions.value,
                loadedEntries: deserializeEntries(dataFileDataStr.value),
            }
        } catch (e) {
            console.error(e);
            return;
        }
    }

    async function dataFileReload(file_id) {
        // Retrieve a file you've opened before. Show's no filepicker UI, but can show
        // some other permission prompt if the browser so desires.
        // The browser can choose when to allow or not allow this open.
        console.log(`dataFileReload file_id`, file_id);
        console.log(`dataFileDB`, dataFileDB);
        let dataFileDBTransaction = dataFileDB.transaction(
            ["filerefs"],
            "readonly"
        );
        let dataFileDBObjectStore = dataFileDBTransaction.objectStore("filerefs");
        console.log(`indexNames`, dataFileDBObjectStore.indexNames);
        console.log(`keyPath`, dataFileDBObjectStore.keyPath);
        console.log(`name`, dataFileDBObjectStore.name);
        console.log(`transaction`, dataFileDBObjectStore.transaction);
        console.log(`autoIncrement`, dataFileDBObjectStore.autoIncrement);
        let dataFileDBRequest = await dataFileDBObjectStore.get(file_id);
        dataFileDBRequest.onsuccess = async function (e) {
            dataFileHandle.value = dataFileDBRequest.result;
            console.log(`dataFileHandle.value: `, dataFileHandle.value);

            if (!dataFileHandle.value) {
                console.log(`no result`);
                return;
            }

            // Permissions for the handle may have expired while the handle was stored
            // in IndexedDB. Before it is safe to use the handle we should request at
            // least read access to the handle again.
            await dataFileCheckPermissions();

            // // Rejects if file is no longer readable, either because it doesn't exist
            // // anymore or because the website no longer has permission to read it.
            // let file = await dataFileHandle.value.file();
            // // ... read from file

            // // Rejects if file is no longer writable, because the website no longer has
            // // permission to write to it.
            // let file_writer = await dataFileHandle.value.createWritable();
            // // ... write to file_writer

            console.log("dataFilePermissions.value", dataFilePermissions.value);
            if (dataFilePermissions.value == "granted") await dataFileLoad();
        };
    }

    return {
        // dataFileName,
        selectedFileFlog,
        dataFilePermissions,
        launchOpenFileFlow,
        launchRequestPermissionsFlow,
        dataFileSave,
        dataFileClose,
    };
};



