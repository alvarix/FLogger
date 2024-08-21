import { ref, Ref } from "vue"
import * as fetch from "isomorphic-fetch";
import { IFlog, deserializeEntries } from "@/modules/Flog"
import { Dropbox, DropboxAuth } from "dropbox";
// See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html

export interface IDropboxFlog extends IFlog {
}

export interface IDropboxFlogs {
    launchConnectFlow: () => void
    hasConnection: Ref<boolean>
    clearConnection: () => void
    availableFlogs: Ref<IDropboxFlog[]>
    loadFlogEntries: (flog: IDropboxFlog) => IDropboxFlog[]
}

export const useDropboxFlogs = (): IDropboxFlogs => {


    const hostname = "localhost";
    const port = 5173;
    var CLIENT_ID = "irjhf3obwytvv53"; //flogger-ccc4
    //"lsu851xgok0qryy"; //Flogger Starscream
    //"k2i486lvdpfjyhj"; //"q5qja4ma5qcl0qc"; //flogger-chad: q5qja4ma5qcl0qc //ORIGINAL EXAMPLE: 42zjexze6mfpf7x

    const config = {
        fetch,
        clientId: CLIENT_ID,
    };

    const dbxAuth = new DropboxAuth(config);

    const dbxAuthReturnUri = `http://${hostname}:${port}/`;

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

    const availableFlogs = ref([]);


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
                console.log("reloadUrl", reloadUrl);
                window.location.href = reloadUrl;
            })
            .catch((e) => {
                console.log("Error getting access token from URL:", e.error || e);
                console.log("reloadUrl", reloadUrl);
                window.location.href = reloadUrl;
            });
        // .catch((error) => {
        //   console.error(error.error || error);
        // });
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
            // 6. Set availableFlogs to display
            .then((response) => {
                console.log("step 6");
                availableFlogs.value = response.result.entries
                    .filter((item) => item.path_lower.endsWith(".flogger"))
                    .map((item) => {
                        console.log("mapping item", item);
                        const newFlog: IDropboxFlog = { url: item.path_lower, loadedEntries: [] }
                        return newFlog;
                    });
            })
            .catch((e) => {
                console.log("Error listing dropbox folders:", e?.message || e);
                clearConnection();
            });
    }

    const launchConnectFlow = () => {
        console.log("launchConnectFlow");
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
        availableFlogs.value = [];
    }

    const loadFlogEntries = (flog: IDropboxFlog) => {
        console.log('loadFlogEntries flog', flog)

        dbxAuth.checkAndRefreshAccessToken();
        dbx
            .filesDownload({ path: flog.url })
            .then((response) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = e.target.result;
                    flog.loadedEntries = deserializeEntries(fileData as string)
                };
                //@ts-expect-error
                reader.readAsText(response.result.fileBlob);
            })
            .catch((error) => {
                console.log(
                    `Error downloading flog ${flog.url} :`,
                    error?.message || error
                );
                clearConnection();
            });

    }

    return {
        launchConnectFlow,
        hasConnection,
        clearConnection,
        availableFlogs,
        loadFlogEntries,
    }
}