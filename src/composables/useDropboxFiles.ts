import { ref, Ref } from "vue"
// import * as fetch from "isomorphic-fetch";
import fetch from "cross-fetch";
// import fetch from "node-fetch";
import { Dropbox, DropboxAuth } from "dropbox";
// See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html

export interface IDropboxFile {
    path: string;
    content?: string;
    rev?: string;
}

export interface IDropboxFiles {
    launchConnectFlow: () => void
    hasConnection: Ref<boolean>
    clearConnection: () => void
    availableFiles: Ref<IDropboxFile[]>
    loadFileContent: (file: IDropboxFile, callback: (result: { rev: string, content: string }) => any) => void,
    saveFileContent: (file: IDropboxFile, callback: (result: any) => any) => void,
    addFile: (file: IDropboxFile, callback: () => any) => void
}

export const useDropboxFiles = (): IDropboxFiles => {


    const hostname = import.meta.env.VITE_VERCEL_URL || import.meta.env.VERCEL_URL;
    console.log('VERCEL_URL', import.meta.env.VERCEL_URL)
    console.log('VITE_VERCEL_URL', import.meta.env.VITE_VERCEL_URL)
    const protocol = (hostname == 'localhost' ? 'http://' : 'https://');
    const port = (hostname == 'localhost' ? ':5173' : '');
    var CLIENT_ID = "85vbmd9vlyyb5kp" //Flogger data
    //"irjhf3obwytvv53"; //flogger-ccc4
    //"lsu851xgok0qryy"; //Flogger Starscream
    //"k2i486lvdpfjyhj"; //"q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x

    console.log('fetch', fetch)
    console.log('globalThis.fetch', globalThis.fetch)
    // The following variation from mdn docs produced this error:
    // "Error getting access token from URL: TypeError: 'fetch' called on an object that does not implement interface Window."
    // if (typeof globalThis.fetch === "undefined") {
    //     Object.defineProperty(globalThis, "fetch", {
    //         value: isoFetch,
    //         enumerable: false,
    //         configurable: true,
    //         writable: true,
    //     });
    // }
    // The following (seen on stackoverflow) produced this error:
    // "Uncaught TypeError: window.fetch.bind is not a function"
    // globalThis.fetch = fetch;
    // Same issue when I use import * as isoFetch from "isomorphic-fetch")
    // globalThis.fetch = isoFetch;
    // Object.defineProperty(globalThis, "fetch", fetch);

    // Object.defineProperty(globalThis, "fetch", {
    //     value: fetch,
    //     enumerable: false,
    //     configurable: true,
    //     writable: true,
    // });
    // console.log('globalThis.fetch', globalThis.fetch)

    // Changing the config line to an arrow function to retain reference to fetch in this file results in error: 
    // "Uncaught TypeError: As is not a function"
    // const config = {
    //     fetch: (...args) => { return fetch(...args) },
    //     ...
    // }

    const config = {
        fetch: (...args) => { return fetch(...args) },
        // fetch: (args) => fetch(args),
        clientId: CLIENT_ID,
    };

    const dbxAuth = new DropboxAuth(config);

    const dbxAuthReturnUri = `${protocol}${hostname}${port}/`;
    console.log('dbxAuthReturnUri', dbxAuthReturnUri)

    // Parses the url and gets the access token if it is in the urls hash
    const getDbxAuthCodeFromUrl = () => {
        const params = new URL(window.location.href).searchParams;
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

    const availableFiles = ref([]);


    const hasConnection = ref(false)


    if (hasRedirectedFromAuth.value) {
        console.log(`dbxAuthReturnUri`, dbxAuthReturnUri);
        console.log(`dbxAuthCode`, dbxAuthCode.value);

        const codeVerifier = window.sessionStorage.getItem("codeVerifier");
        console.log(`codeVerifier:`, codeVerifier);
        dbxAuth.setCodeVerifier(codeVerifier);
        const reloadUrl = removeAuthCodeFromUrl(window.location.href);
        console.log("step 1");
        dbxAuth
            // 1. Get token
            .getAccessTokenFromCode(dbxAuthReturnUri, dbxAuthCode.value)
            // 2. Save token and reload
            .then((response) => {
                console.log("step 2");
                window.sessionStorage.setItem(
                    "accessToken",
                    // @ts-expect-error
                    response.result.access_token
                );
                console.log("Reload to remove code from url => ", reloadUrl);
                window.location.href = reloadUrl;
            })
            .catch((e) => {
                console.log("Error getting access token from URL:", e.error || e);
                console.log("Reload to remove code from url => ", reloadUrl);
                window.location.href = reloadUrl;
            });
    }

    // 3. Get token
    let accessToken = window.sessionStorage.getItem("accessToken");
    hasConnection.value = (accessToken && accessToken != "") ? true : false
    if (hasConnection.value) {
        console.log("step 3a from sessionStorage");
        dbxAuth.setAccessToken(accessToken);
    } else {
        console.log("step 3b check from dbxAuth");
        window.sessionStorage.removeItem("accessToken");
        accessToken = dbxAuth.getAccessToken();
    }

    console.log("accessToken:", accessToken);

    if (hasConnection.value) {
        // 4. Check/refresh token
        console.log("step 4");
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
            // 6. Set availableFiles to display
            .then((response) => {
                console.log("step 6");
                availableFiles.value = response.result.entries
                    .filter((item) => (item.path_lower.endsWith(".flogger") || item.path_lower.endsWith(".flogger.txt")))
                    .map((item) => {
                        const newFile: IDropboxFile = { path: item.path_lower, rev: item[".tag"] }
                        return newFile;
                    });
            })
            .catch((e) => {
                console.log("Error listing dropbox folders:", e?.message || e);
                clearConnection();
            });
    }

    const launchConnectFlow = () => {
        console.log("launchConnectFlow");
        console.log("dbxAuthReturnUri", dbxAuthReturnUri);

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
                clearConnection();
                //@ts-expect-error
                window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
                //@ts-expect-error
                console.log("dbxAuth.codeVerifier", dbxAuth.codeVerifier);
                //@ts-expect-error
                window.location.href = authUrl;
            })
            .catch((error) => {
                console.log(`Error getting auth URL:`, error?.message || error);
                clearConnection();
            });

    }

    const clearConnection = () => {
        console.log("clearConnection");
        window.sessionStorage.removeItem("accessToken");
        window.sessionStorage.removeItem("codeVerifier");
        dbxAuthCode.value = undefined;
        accessToken = undefined;
        hasConnection.value = false
        availableFiles.value = [];
    }

    const loadFileContent = async (file: IDropboxFile, callback: (result: { rev: string, content: string }) => any) => {
        console.log('loadFileContent file', file)

        dbxAuth.checkAndRefreshAccessToken();
        await dbx
            .filesDownload({ path: file.path })
            .then((response) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = e.target.result;
                    callback(
                        {
                            rev: response.result.rev,
                            content: fileData as string
                        }
                    )
                };
                //@ts-expect-error - dbx doesn't have typing for fileBlob for some reason
                reader.readAsText(response.result.fileBlob);
            })
            .catch((error) => {
                console.log(
                    `Error downloading file ${file.path} :`,
                    error?.message || error
                );
                clearConnection();
            });
    }

    const saveFileContent = async (file: IDropboxFile, callback: (result: any) => any) => {
        console.log('saveFileContent file', file)

        dbxAuth.checkAndRefreshAccessToken();
        await dbx
            .filesUpload(
                {
                    path: file.path,
                    contents: file.content,
                    mode: { ".tag": "update", "update": file.rev }
                }
            )
            .then((response) => {
                console.log(response)
                callback(response.result)
            })
            .catch((error) => {
                console.log(
                    `Error uploading file ${file.path} :`,
                    error.error.error_summary
                );
                // clearConnection();
            });
    }

    const addFile = async (file: IDropboxFile, callback: () => any) => {
        console.log('addFile file', file)

        dbxAuth.checkAndRefreshAccessToken();
        await dbx
            .filesUpload(
                {
                    // Must add the slash in front of paths. This is relative to the root of the app folder in Dropbox
                    path: "/" + file.path,
                    contents: file.content,
                    mode: { ".tag": "add" }
                }
            )
            .then((response) => {
                console.log(response)
                callback()
            })
            .catch((error) => {
                console.log(
                    `Error uploading file ${file.path} :`,
                    error.error.error_summary
                );
                // clearConnection();
            });
    }

    return {
        launchConnectFlow,
        hasConnection,
        clearConnection,
        availableFiles,
        loadFileContent,
        saveFileContent,
        addFile,
    }
}