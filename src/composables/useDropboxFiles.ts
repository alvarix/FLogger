import { ref, watch } from "vue"
import type { Ref } from "vue"
import fetch from "cross-fetch";
import { Dropbox, DropboxAuth } from "dropbox";
import type { Timestamp as DropboxTimestamp, users as DropboxUsers } from "dropbox";
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
    accountInfo: Ref<DropboxUsers.FullAccount | null>
    launchConnectFlow: (targetWindow: Window) => void
    openDbxPopup: (targetWindow: Window) => void
    // eslint-disable-next-line
    connectionPopupWindow: Ref<any>
    hasConnection: Ref<boolean>
    clearConnection: () => void
    availableFiles: Ref<IDropboxFile[]>
    availableRepoFiles: Ref<IDropboxFile[]>
    // eslint-disable-next-line
    loadFileContent: (file: IDropboxFile, callback?: (result: ILoadFileContentCallbackResult) => any) => void,
    // eslint-disable-next-line
    saveFileContent: (file: IDropboxFile, callback?: (result: any) => any) => void,
    // eslint-disable-next-line
    addFile: (file: IDropboxFile, callback?: (result: any) => any) => void
    // eslint-disable-next-line
    deleteFile: (file: IDropboxFile, callback?: (result: any) => any) => void
    accountOwner: Ref<string | null>
}

export interface ILoadFileContentCallbackResult {
    rev?: string,
    content?: string,
    error?: string
}

// type ILoadFileContentCallbackResult = ILoadFileContentCallbackSuccess | ILoadFileContentCallbackError

export interface ILoadFileContentCallbackSuccess extends ILoadFileContentCallbackResultRaw {
    rev: string, content: string
}

export type ILoadFileContentCallbackError = ConditionalErrorOrResultProperties<ILoadFileContentCallbackResultRaw, 'error', 'content', 'rev'>; // first prop is required if other props are undefined
// type ExampleType2 = ConditionalProperty<ILoadFileContentCallbackResultRaw, 'propA', 'propB', 'propC'>; // first prop is required if other props are undefined


export interface ILoadFileContentCallbackResultRaw {
    rev?: string,
    content?: string,
    error?: string
}

type ConditionalErrorOrResultProperties<T, REQUIREDKEY extends keyof T, UNDEFINEDKEY1 extends keyof T, UNDEFINEDKEY2 extends keyof T> =
    T[UNDEFINEDKEY1] extends undefined
    ? (T[UNDEFINEDKEY2] extends undefined
        ? T & Required<Pick<T, REQUIREDKEY>> & Partial<Omit<T, REQUIREDKEY>>
        : T)
    : T



// export interface ILoadFileContentCallbackError {
//     error: string
// }

// let refreshTokenInterval;
// const refreshToken = () => {
//     console.log("refreshToken before expiry");
//     // dbxAuth.checkAndRefreshAccessToken();
// }
// const clearRefreshTokenInterval = () => {
//     console.log("clearing refreshTokenInterval");
//     if (refreshTokenInterval) clearInterval(refreshTokenInterval)
// }
// onBeforeUnmount(() => {
//     clearRefreshTokenInterval();
// })

let hasInitialized = false;

const defaultFlogFilename = 'default.flogger.txt'
const defaultFlogContents = 'This is your default flog, where quick entries can be made without needing to find and open a flog first.'

export const useDropboxFiles = (repoTemplateFiles?: IDropboxFile[]): IDropboxFiles => {

    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    const environment = import.meta.env.VERCEL_ENV || import.meta.env.VITE_VERCEL_ENV || 'development';
    console.log('environment', environment)

    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    console.log('VITE_VERCEL_URL', import.meta.env.VITE_VERCEL_URL)
    // @ts-expect-error - Unsure why env isn't in the type definition for import.meta
    console.log('VERCEL_URL', import.meta.env.VERCEL_URL)

    const hostname = location.hostname;

    const protocol = location.protocol + '//';

    const port = location.port ? ':' + location.port : '';

    const dbxAuthReturnUri = `${protocol}${hostname}${port}/dbauthpopup/`;
    console.log('dbxAuthReturnUri', dbxAuthReturnUri)

    // Parses the url and gets the access token if it is in the urls hash
    const getDbxAuthCodeFromUrl = () => {
        const params = new URL(window.location.href).searchParams;
        const code = params.get("code") ?? undefined;
        return code;
    };

    const dbxAuthCode = ref(getDbxAuthCodeFromUrl());
    const dbxAuthUrl = ref();

    const hasRedirectedFromAuth = ref(!!dbxAuthCode.value);

    // // Support for .flogger.config settings file. 
    // // Commenting out for now.
    // const settingsFile = ref<{}>();

    const CLIENT_ID = "85vbmd9vlyyb5kp" //Flogger data
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

    const hasConnection = ref(false)
    let accessToken
    const availableFiles = ref<IDropboxFile[]>([]);
    const availableRepoFiles = ref<IDropboxFile[]>([]);


    // Fetch account information
    const fetchAccountInfo = () => {
        console.log('fetchAccountInfo')
        // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
        dbxAuth.checkAndRefreshAccessToken().then(() => {
            const dbx = new Dropbox({ auth: dbxAuth });
            dbx.usersGetCurrentAccount().then(response => {
                console.log('fetchAccountInfo : usersGetCurrentAccount', response)
                accountInfo.value = response.result;
                accountOwner.value = response.result.email;
            }).catch(error => {
                console.log("Error fetching account info:", error);
                clearConnection();
            });
        });
    };


    // We only want to execute logic for returning from Dropbox once on page load
    // This conditional prevents it from executing every place this composable is used.
    if (!hasInitialized) {

        if (hasRedirectedFromAuth.value) {

            const codeVerifier = window.sessionStorage.getItem("codeVerifier");
            console.log('codeVerifier', codeVerifier)
            dbxAuth.setCodeVerifier(codeVerifier || '');

            // dbxauth-popup: Not needed because code is in URL of popup, which gets closed. Opener window is simply reloaded.
            // const reloadUrl = removeAuthCodeFromUrl(window.location.href);

            console.log("step 1");
            dbxAuth
                // 1. Get token
                .getAccessTokenFromCode(dbxAuthReturnUri, dbxAuthCode.value || '')
                // 2. Save token and reload
                .then((response) => {
                    console.log("step 2");
                    // console.log("getAccessTokenFromCode result:", response.result)
                    // dbxauth-popup: Set accessToken in sessionStorage of opener instead of current window, reload opener instead of current, and close current.
                    window.opener.sessionStorage.setItem(
                        "accessToken",
                        // @ts-expect-error — Unsure how to type Dropbox response.result
                        response.result.access_token
                    );
                    // dbxauth-popup: Set expiresIn in sessionStorage of opener.
                    window.opener.sessionStorage.setItem(
                        "expiresIn",
                        // @ts-expect-error — Unsure how to type Dropbox response.result
                        response.result.expires_in
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
        // 3.b. Get expires in value
        accessToken = window.sessionStorage.getItem("accessToken");
        // eslint-disable-next-line
        let expiresIn = window.sessionStorage.getItem("expiresIn") as any || -1;
        hasConnection.value = (accessToken && accessToken != "") ? true : false
        if (hasConnection.value) {
            console.log("step 3a from sessionStorage");
            dbxAuth.setAccessToken(accessToken || '');
        } else {
            console.log("step 3b check from dbxAuth");
            window.sessionStorage.removeItem("accessToken");
            window.sessionStorage.removeItem("codeVerifier");
            window.sessionStorage.removeItem("expiresIn");
            // clearRefreshTokenInterval();

            accessToken = dbxAuth.getAccessToken();

            const now = new Date();
            const then = dbxAuth.getAccessTokenExpiresAt();
            if (then) {
                const diffInMilliseconds = now.getTime() - then.getTime();
                expiresIn = Math.floor(diffInMilliseconds / 1000);
            }
        }
        console.log("accessToken:", accessToken);
        console.log('expiresIn', expiresIn)

        // Call fetchAccountInfo when access token is set
        if (accessToken) {
            fetchAccountInfo();
        }


        // // 3.c. Set interval to refresh token
        // // This interval needs to be cleared, but unsure where
        // if (expiresIn && expiresIn > 0) {
        //     refreshTokenInterval = window.setInterval(
        //         refreshToken,
        //         expiresIn * 0.9
        //     )
        //     console.log('refreshTokenInterval', refreshTokenInterval)
        // }

        hasInitialized = true
    }


    const dbx = new Dropbox({
        auth: dbxAuth,
    });

    const checkAvailableFiles = () => {
        // 4. Check/refresh token
        console.log("step 4");
        dbxAuth.checkAndRefreshAccessToken()
            // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
            .then(async () => {
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
                        repoTemplateFiles?.forEach(item => repoTemplateFilesMap.set('/' + item.path.toLowerCase(), true))

                        // Support for repo template/default files
                        // * Var to easily check if a template file exists in the filesListFolder response
                        const repoFilePathsFound = new Map<string, boolean>()

                        // Support for default flog
                        let foundDefaultFlog = false;

                        // Set availableFiles from filesListFolder response 
                        // Filtering out files that match the repoTemplateFiles
                        availableFiles.value = response.result.entries
                            .filter((item) => (item.path_lower?.endsWith(".flogger") || item.path_lower?.endsWith(".flogger.txt")))
                            .filter(item => !repoTemplateFilesMap.get(item.path_lower || ''))
                            .map((item) => {
                                // Support for default flog
                                if (item.path_display == "/" + defaultFlogFilename) foundDefaultFlog = true;
                                const newFile: IDropboxFile = {
                                    path: item.path_display || '',
                                    // @ts-expect-error - Unsure how to get item typed correctly
                                    rev: item.rev,
                                    tag: item[".tag"],
                                    // @ts-expect-error - Unsure how to get item typed correctly
                                    modified: item.server_modified
                                }
                                return newFile;
                            });

                        // Support for default flog
                        if (!foundDefaultFlog) {
                            console.log(`Creating default flog ${defaultFlogFilename}`)
                            addFile({
                                path: defaultFlogFilename,
                                content: defaultFlogContents
                            }, (response) => {
                                console.log(`Done initializing ${defaultFlogFilename}`, response)
                            })
                        }

                        // Support for repo template/default files
                        // Set availableRepoFiles from filesListFolder response 
                        // Filtering out files that DON'T match the repoTemplateFiles
                        // And set the keys in repoFilePathsFound
                        availableRepoFiles.value = response.result.entries
                            .filter((item) => (item.path_lower?.endsWith(".flogger") || item.path_lower?.endsWith(".flogger.txt")))
                            .filter(item => repoTemplateFilesMap.get(item.path_lower || ''))
                            .map((item) => {
                                const newFile: IDropboxFile = {
                                    path: item.path_display || '',
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
                                repoFilePathsFound.set(item.path_lower || '', true);
                                return newFile;
                            });

                        // Each repoTemplateFiles should have a key in repoFilePathsFound with value true.
                        // Otherwise need to create the file in Dropbox.
                        // console.log('repoTemplateFiles', repoTemplateFiles)
                        // console.log('repoFilePathsFound', repoFilePathsFound)
                        repoTemplateFiles?.forEach(file => {
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
            })
            .catch((error: unknown) => {
                console.log(
                    `Error refreshing access`,
                    (error instanceof Error && error?.message) || error
                );
                clearConnection();
            })

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

    // eslint-disable-next-line
    const connectionPopupWindow = ref<any>()
    const launchConnectFlow = (targetWindow: Window) => {
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
                dbxAuthUrl.value = authUrl
                clearConnection();
                //@ts-expect-error — Unsure why the dbxAuth typing is not recognizing codeVerifier
                targetWindow.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
                //@ts-expect-error — Unsure why the dbxAuth typing is not recognizing codeVerifier
                console.log("dbxAuth.codeVerifier", dbxAuth.codeVerifier);
                // // dbxauth-popup: Replace open popup rather than redirecting to Db in this window
                // const windowFeatures = "popup=true,menubar=false,width=700height=700,innerWidth=700,innerHeight=700,left=100,top=100";
                // //@ts-expect-error
                // connectionPopupWindow.value = window.open(authUrl, 'dbauthPopupWindow', windowFeatures)
                // console.log('connectionPopupWindow.value', connectionPopupWindow.value)
                openDbxPopup(targetWindow);
            })
            .catch((error) => {
                console.error(`Error getting auth URL:`, error?.message || error);
                clearConnection();
            });
    }

    const openDbxPopup = (targetWindow: Window) => {
        try {
            // const windowFeatures = "popup=true,menubar=false,width=700height=700,innerWidth=700,innerHeight=700,left=100,top=100";
            // window.open(dbxAuthUrl.value, 'dbauthPopupWindow', windowFeatures)
            connectionPopupWindow.value = targetWindow.location.href = dbxAuthUrl.value
            console.log('connectionPopupWindow.value', connectionPopupWindow.value)
        }
        catch (error: unknown) {
            console.error(`Error getting auth URL:`, (error instanceof Error && error?.message) || error);
            clearConnection();
        };

    }


    const clearConnection = () => {
        console.log("clearConnection");
        connectionPopupWindow.value = undefined;
        window.sessionStorage.removeItem("accessToken");
        window.sessionStorage.removeItem("expiresIn");
        window.sessionStorage.removeItem("codeVerifier");
        window.sessionStorage.removeItem("defaultFlogAlreadyOpened")
        // clearRefreshTokenInterval();
        dbxAuthCode.value = undefined;
        accessToken = undefined;
        hasConnection.value = false
        availableFiles.value = [];
        availableRepoFiles.value = [];
    }

    // loadFileContent: (file: IDropboxFile, 
    const loadFileContent = async (
        file: IDropboxFile,
        // eslint-disable-next-line
        callback?: (result: ILoadFileContentCallbackResult) => void
    ) => {
        console.log('loadFileContent file', file)

        // dbxAuth.checkAndRefreshAccessToken();
        dbxAuth.checkAndRefreshAccessToken()
            // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
            .then(async () => {
                await dbx
                    .filesDownload({ path: file.path })
                    .then((response) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const fileData = e.target != null ? e.target.result : null;
                            if (callback !== undefined)
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
                            `Error downloading file ${file.path} :`, file,
                            JSON.stringify(error)
                        );
                        // clearConnection();
                        // The Dropbox return for an error includes several nested error objects.
                        // console.log("TAGS load error", error.error)
                        if (error.error.error['.tag'] == 'path' && error.error.error.path['.tag'] == "not_found") {
                            if (callback !== undefined)
                                callback(
                                    {
                                        error: "file not found"
                                    } as ILoadFileContentCallbackError
                                )

                        }
                    });
            })
            .catch((error: unknown) => {
                console.log(
                    `Error refreshing access`,
                    (error instanceof Error && error?.message) || error
                );
                clearConnection();
            })
    }

    // eslint-disable-next-line
    const saveFileContent = async (file: IDropboxFile, callback?: (result: any) => any) => {
        // console.log('saveFileContent file', file)

        dbxAuth.checkAndRefreshAccessToken()
            // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
            .then(async () => {
                await dbx
                    .filesUpload(
                        {
                            path: file.path,
                            contents: file.content,
                            mode: { ".tag": "update", "update": file.rev || '' }
                        }
                    )
                    .then((response) => {
                        if (callback !== undefined)
                            callback(response.result)
                    })
                    .catch((error) => {
                        console.log(
                            `Error saving file ${file.path} :`,
                            error
                        );
                        alert(`Error saving file ${file.path}:\n\n${error?.error?.error_summary}`)
                        // clearConnection();
                    });
            })
            .catch((error: unknown) => {
                console.log(
                    `Error refreshing access`,
                    (error instanceof Error && error?.message) || error
                );
                clearConnection();
            })
    }

    // eslint-disable-next-line
    const addFile = async (file: IDropboxFile, callback?: (result?: any) => any) => {
        // console.log('addFile file', file)

        // function addToAvailable(file) {
        //     availableFiles.value = availableFiles.value.concat([file])
        // }

        dbxAuth.checkAndRefreshAccessToken()
            // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
            .then(async () => {
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
                        if (callback !== undefined)
                            callback(response.result)
                    })
                    .catch((error) => {
                        console.log(
                            `Error adding file ${file.path} :`,
                            error.error.error_summary
                        );
                        alert(`Error adding file ${file.path}:\n\n${error.error.error_summary}`)
                        // clearConnection();
                    });
            })
            .catch((error: unknown) => {
                console.log(
                    `Error refreshing access`,
                    (error instanceof Error && error?.message) || error
                );
                clearConnection();
            })
    }

    // eslint-disable-next-line
    const deleteFile = async (file: IDropboxFile, callback?: (result?: any) => any) => {
        // console.log('addFile file', file)

        dbxAuth.checkAndRefreshAccessToken()
            // @ts-expect-error - Unsure why checkAndRefreshAccessToken is typed to return void but expecting a promise works.
            .then(async () => {
                await dbx
                    .filesDeleteV2(
                        {
                            // Must add the slash in front of paths. This is relative to the root of the app folder in Dropbox
                            path: file.path,
                            parent_rev: file.rev
                        }
                    )
                    .then((response) => {
                        console.log("deleteFile response", response)
                        checkAvailableFiles()
                        if (callback !== undefined)
                            callback(response.result)
                    })
                    .catch((error) => {
                        console.log(
                            `Error deleting file ${file.path} :`,
                            error.error.error_summary
                        );
                        alert(`Error deleting file ${file.path}:\n\n${error.error.error_summary}`)
                        // clearConnection();
                    });
            })
            .catch((error: unknown) => {
                console.log(
                    `Error refreshing access`,
                    (error instanceof Error && error?.message) || error
                );
                clearConnection();
            })
    }

    const accountOwner = ref<string | null>(null);
    const accountInfo = ref<DropboxUsers.FullAccount | null>(null);





    return {
        accountInfo,
        accountOwner,
        launchConnectFlow,
        connectionPopupWindow,
        openDbxPopup,
        hasConnection,
        clearConnection,
        availableFiles,
        availableRepoFiles,
        loadFileContent,
        saveFileContent,
        deleteFile,
        addFile,
    }
}