import { ref, Ref, watch } from "vue"
import fetch from "cross-fetch";
import { Dropbox, DropboxAuth, Timestamp as DropboxTimestamp } from "dropbox";
// See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html

export interface IDropboxFile {
    path: string;
    content?: string;
    rev?: string;
    tag?: string;   //This is the Db API context type tag, not user-controlled file tag data
    modified?: DropboxTimestamp;
    readOnly?: boolean;
}

export interface IDropboxFiles {
    launchConnectFlow: () => void
    connectionPopupWindow: any
    hasConnection: Ref<boolean>
    clearConnection: () => void
    availableFiles: Ref<IDropboxFile[]>
    availableRepoFiles: Ref<IDropboxFile[]>
    loadFileContent: (file: IDropboxFile, callback: (result: { rev: string, content: string }) => any) => void,
    saveFileContent: (file: IDropboxFile, callback: (result: any) => any) => void,
    addFile: (file: IDropboxFile, callback: () => any) => void
    accountOwner: Ref<string | null>
}

export const useDropboxFiles = (repoTemplateFiles?: IDropboxFile[]): IDropboxFiles => {

    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    const environment = import.meta.env.VERCEL_ENV || import.meta.env.VITE_VERCEL_ENV || 'development';
    console.log('environment', environment)

    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    console.log('VITE_VERCEL_URL', import.meta.env.VITE_VERCEL_URL)
    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    console.log('VERCEL_URL', import.meta.env.VERCEL_URL)
    const hostname = (environment == 'production') ? 'flogger.vercel.app'
        // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
        : import.meta.env.VITE_VERCEL_URL || import.meta.env.VERCEL_URL;
    console.log('hostname', hostname)

    const protocol = (hostname == 'localhost' ? 'http://' : 'https://');

    const port = (hostname == 'localhost' ? ':5173' : '');

    var CLIENT_ID = "85vbmd9vlyyb5kp" //Flogger data
    //"irjhf3obwytvv53"; //flogger-ccc4
    //"lsu851xgok0qryy"; //Flogger Starscream
    //"k2i486lvdpfjyhj"; //"q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x

    const config = {
        // @ts-expect-error - Unsure how to cast or spec ...args for use as the fetch params
        fetch: (...args) => { return fetch(...args) },
        // fetch: (args) => fetch(args),
        clientId: CLIENT_ID,
    };

    const dbxAuth = new DropboxAuth(config);

    const dbxAuthReturnUri = `${protocol}${hostname}${port}/dbauthpopup/`;
    console.log('dbxAuthReturnUri', dbxAuthReturnUri)

    // Parses the url and gets the access token if it is in the urls hash
    const getDbxAuthCodeFromUrl = () => {
        const params = new URL(window.location.href).searchParams;
        const code = params.get("code");
        return code;
    };
    const removeAuthCodeFromUrl = (urlString) => {
        let url = new URL(urlString);
        url.searchParams.delete("code");
        return url.toString();
    };

    const dbxAuthCode = ref(getDbxAuthCodeFromUrl());

    const hasRedirectedFromAuth = ref(!!dbxAuthCode.value);

    const availableFiles = ref<IDropboxFile[]>([]);
    const availableRepoFiles = ref<IDropboxFile[]>([]);

    const hasConnection = ref(false)

    // // Support for .flogger.config settings file. 
    // // Commenting out for now.
    // const settingsFile = ref<{}>();


    if (hasRedirectedFromAuth.value) {

        const codeVerifier = window.sessionStorage.getItem("codeVerifier");
        dbxAuth.setCodeVerifier(codeVerifier);

        // dbxauth-popup: Not needed because code is in URL of popup, which gets closed. Opener window is simply reloaded.
        // const reloadUrl = removeAuthCodeFromUrl(window.location.href);

        console.log("step 1");
        dbxAuth
            // 1. Get token
            .getAccessTokenFromCode(dbxAuthReturnUri, dbxAuthCode.value)
            // 2. Save token and reload
            .then((response) => {
                console.log("step 2");
                // dbxauth-popup: Set accessToken in sessionStorage of opener instead of current window, reload opener instead of current, and close current.
                window.opener.sessionStorage.setItem(
                    "accessToken",
                    // @ts-expect-error
                    response.result.access_token
                );
                // window.opener.connectionPopupWindow.value = false;
                window.opener.location.reload();
                window.close();
            })
            .catch((e) => {
                console.log("Error getting access token from URL:", e.error || e);
                // dbxauth-popup: Reload opener instead of current, and close current.
                // window.opener.connectionPopupWindow.value = false;
                window.opener.reload();
                window.close();
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

    var dbx = new Dropbox({
        auth: dbxAuth,
    });


    const checkAvailableFiles = () => {
        // 4. Check/refresh token
        console.log("step 4");
        dbxAuth.checkAndRefreshAccessToken();
        // 5. Use token to get files
        console.log("step 5");
        dbx
            .filesListFolder({
                path: "",
                recursive: true
            })
            // 6. Set availableFiles to display
            .then((response) => {
                console.log("step 6");

                // Support for repo template/default files
                // Create a map of the paths in repoTemplateFiles to efficiently check against files in user's dropbox
                // Use lowercase to avoid mixed case possibilities, because 
                // Dropbox supports cased filenames but enforces case insensative uniqueness
                const repoTemplateFilesMap = new Map<string, boolean>()
                repoTemplateFiles.forEach(item => repoTemplateFilesMap.set('/' + item.path.toLowerCase(), true))

                // Support for repo template/default files
                // * Var to easily check if a template file exists in the filesListFolder response
                let repoFilePathsFound = new Map<string, boolean>()

                // Set availableFiles from filesListFolder response 
                // Filtering out files that match the repoTemplateFiles
                availableFiles.value = response.result.entries
                    .filter((item) => (item.path_lower.endsWith(".flogger") || item.path_lower.endsWith(".flogger.txt")))
                    .filter(item => !repoTemplateFilesMap.get(item.path_lower))
                    .map((item) => {
                        const newFile: IDropboxFile = {
                            path: item.path_display,
                            // @ts-expect-error - Unsure how to get item typed correctly
                            rev: item.rev,
                            tag: item[".tag"],
                            // @ts-expect-error - Unsure how to get item typed correctly
                            modified: item.server_modified
                        }
                        return newFile;
                    });

                // Support for repo template/default files
                // Set availableRepoFiles from filesListFolder response 
                // Filtering out files that DON'T match the repoTemplateFiles
                // And set the keys in repoFilePathsFound
                availableRepoFiles.value = response.result.entries
                    .filter((item) => (item.path_lower.endsWith(".flogger") || item.path_lower.endsWith(".flogger.txt")))
                    .filter(item => repoTemplateFilesMap.get(item.path_lower))
                    .map((item) => {
                        const newFile: IDropboxFile = {
                            path: item.path_display,
                            // @ts-expect-error - Unsure how to get item typed correctly
                            rev: item.rev,
                            tag: item[".tag"],
                            // @ts-expect-error - Unsure how to get item typed correctly
                            modified: item.server_modified,
                            readOnly: true,
                        }
                        // * Var to easily check if a template file exists in the filesListFolder response
                        // Use lowercase to avoid mixed case possibilities, because 
                        // Dropbox supports cased filenames but enforces case insensative uniqueness
                        repoFilePathsFound.set(item.path_lower, true);
                        return newFile;
                    });

                // Each repoTemplateFiles should have a key in repoFilePathsFound with value true.
                // Otherwise need to create the file in Dropbox.
                // console.log('repoTemplateFiles', repoTemplateFiles)
                // console.log('repoFilePathsFound', repoFilePathsFound)
                repoTemplateFiles.forEach(file => {
                    const pathLower = file.path.toLowerCase();
                    if (!repoFilePathsFound.get('/' + pathLower)) {
                        console.log(`Initializing ${file.path}`, file)
                        addFile({
                            path: file.path,
                            content: file.content
                        }, (response) => {
                            console.log(`Done initializing ${file.path}`, response)
                        })
                    }
                })
            })
            .catch((e) => {
                console.log("Error listing dropbox folders:", e?.message || e);
                clearConnection();
            });

    }

    // if (hasConnection.value) {
    //     checkAvailableFiles();
    // }
    // I'm not sure if this is useful...
    watch(hasConnection, () => {
        if (hasConnection.value) {
            checkAvailableFiles();
        }
    }, {
        immediate: true
    })

    const connectionPopupWindow = ref<any>()
    const launchConnectFlow = () => {
        // console.log("launchConnectFlow", "dbxAuthReturnUri", dbxAuthReturnUri);

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
                // dbxauth-popup: Replace open popup rather than redirecting to Db in this window
                const windowFeatures = "popup=true,menubar=false,width=700height=700,innerWidth=700,innerHeight=700,left=100,top=100";
                //@ts-expect-error
                connectionPopupWindow.value = window.open(authUrl, 'dbauthPopupWindow', windowFeatures)
            })
            .catch((error) => {
                console.log(`Error getting auth URL:`, error?.message || error);
                clearConnection();
            });

    }

    const clearConnection = () => {
        console.log("clearConnection");
        connectionPopupWindow.value = undefined;
        window.sessionStorage.removeItem("accessToken");
        window.sessionStorage.removeItem("codeVerifier");
        dbxAuthCode.value = undefined;
        accessToken = undefined;
        hasConnection.value = false
        availableFiles.value = [];
        availableRepoFiles.value = [];
    }

    const loadFileContent = async (file: IDropboxFile, callback: (result: { rev: string, content: string }) => any) => {
        // console.log('loadFileContent file', file)

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
        // console.log('saveFileContent file', file)

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

    const addFile = async (file: IDropboxFile, callback: (result?: any) => any) => {
        // console.log('addFile file', file)

        // function addToAvailable(file) {
        //     availableFiles.value = availableFiles.value.concat([file])
        // }

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
                // addToAvailable(file)
                checkAvailableFiles()
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

    const accountOwner = ref<string | null>(null);
    const accountInfo = ref(null);

    // Fetch account information
    const fetchAccountInfo = () => {
        // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
        dbxAuth.checkAndRefreshAccessToken().then(() => {
            const dbx = new Dropbox({ auth: dbxAuth });
            dbx.usersGetCurrentAccount().then(response => {
                accountInfo.value = response.result;
                accountOwner.value = response.result.email;
            }).catch(error => {
                console.log("Error fetching account info:", error);
            });
        });
    };

    // Call fetchAccountInfo when access token is set
    if (accessToken) {
        fetchAccountInfo();
    }





    return {
        accountInfo,
        accountOwner,
        launchConnectFlow,
        connectionPopupWindow,
        hasConnection,
        clearConnection,
        availableFiles,
        availableRepoFiles,
        loadFileContent,
        saveFileContent,
        addFile,
    }
}