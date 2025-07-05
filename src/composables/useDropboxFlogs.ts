// Import Vue composition API and types
import { ref, watch } from "vue"
import type { Ref } from "vue"

// Import Flog-related types and utilities
import {
    type IFlog,
    type IEntry,
    IFlogStatus,
    IFlogSourceType,
    deserializeFlog,
    serializeFlog,
} from "@/modules/Flog"

// Import Dropbox files composable and its types
import { useDropboxFiles } from "@/composables/useDropboxFiles"
import type { IDropboxFile, ILoadFileContentCallbackSuccess, ILoadFileContentCallbackError } from "@/composables/useDropboxFiles";

// Import tags composable and related types
import { useTags, type ITagsComposable, type TagMap, type TagFlogMap, type TagFlogFile } from "./useTags"
import type { TagIndex, Tag } from "@/modules/Tag"

// Import utility function for parsing markdown headings
import { parseHeadingsFromMarkdownString } from "@/modules/utilities";

// Re-export types for convenience - these make the types available to consumers of this composable
export type { IFlog as IFlog }
export type { IEntry as IEntry }
export { IFlogStatus as IFlogStatus }; //enum, not a type
export type { ITagsComposable as ITagsComposable }
export type { TagIndex as TagIndex }
export type { TagMap as TagMap }
export type { TagFlogMap as TagFlogMap }
export type { Tag as Tag }
export type { TagFlogFile as TagFlogFile }

// Extended Flog interface that includes Dropbox revision information
export interface IDropboxFlog extends IFlog {
    rev?: string; // Dropbox file revision for conflict resolution
}

// Main interface defining the public API of this composable
export interface IDropboxFlogs {
    // Connection management methods (passed through from useDropboxFiles)
    launchConnectFlow: (targetWindow: Window) => void;
    connectionPopupWindow: Ref<any>; // eslint-disable-next-line
    openDbxPopup: (targetWindow: Window) => void;
    hasConnection: Ref<boolean>;
    clearConnection: () => void;
    
    // Flog management - maps Dropbox files to flog objects
    availableFlogs: Ref<IDropboxFlog[]>; // User's flogs from Dropbox
    availableRepoFlogs: Ref<IDropboxFlog[]>; // Template flogs from repo
    
    // CRUD operations for flog entries
    loadFlogEntries: (flog: IDropboxFlog) => void;
    saveFlogEntries: (flog: IDropboxFlog) => void;
    addFlog: (flog: IDropboxFlog) => void;
    deleteFlog: (flog: IDropboxFlog) => void;
    
    // User account information
    accountOwner: Ref<string | null>;
    
    // Tag management system
    tagIndex: Ref<TagIndex | undefined>; // Manages tags for all flogs in user's Dropbox
    getTagsForFlog: ITagsComposable['getTagsForFlog'];
    getTagsForFlogEntryDate: ITagsComposable['getTagsForFlogEntryDate'];
    tagHasFlogEntryDate: ITagsComposable['tagHasFlogEntryDate'];
    getFlogMapFromTags: ITagsComposable['getFlogMapFromTags'];
}

/*
 * Module-scoped state management:
 * Some composable ref variables are managed at the module level and shared across all instances.
 * This creates singleton behavior for:
 *  - REPO FILES (template files provided to users)
 *  - TAGS INDEX (using useTags composable)
 *  - useDropboxFiles (and its interface parts returned by useDropboxFlogs)
 *  - AVAILABLE FLOGS (user's flog files)
 * 
 * Note: Module-scoped state requires special handling with SSR if we implement it later.
 * See: https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
 */

/*
 * Module-scoped: REPO FILES
 * Template files that are provided to users when they first connect to Dropbox
 */

// Repository files list - contains paths and contents using IDropboxFile interface
// These serve as default template files saved to a user's Dropbox app folder
const repoFiles = ref<IDropboxFile[]>([]);

// In client-side code, we get file paths from env vars but must fetch contents separately
// Files must be in public static folder or served via application routes

// Get file paths using Vite's import.meta.glob for static asset discovery
// @ts-expect-error - Unsure why glob isn't in the type definition for import.meta 
const repoFilesGlob = import.meta.glob("../../public/repo_template/**/*"); // maybe should use "../../public/repo_template/**/*.flogger.txt"

// Path mapping explanation:
// Git repo files are at:            [Git repo root]/public/repo_template/**/*
// import.meta.glob returns:         ../../public/repo_template/**/*
// Dropbox files are saved at:       [User's Dropbox app folder]/**/*
// Frontend fetch URLs are:          [URL domain]/repo_template/**/*
// 
// We remove '../../public/repo_template/' to get Dropbox paths,
// but add '/repo_template/' back for frontend fetch calls

// Process glob results to create repo file entries
for (const propName in repoFilesGlob) {
    if (Object.prototype.hasOwnProperty.call(repoFilesGlob, propName)) {
        const globPathValue = propName
        repoFiles.value.push(
            { path: globPathValue.replace("../../public/repo_template/", "") } //IDropboxFlog
        );
    }
}

// Fetch file contents for each path from the static server
const repoFilesWithContents: IDropboxFile[] = []
repoFiles.value.forEach(async repoFile => {
    // Add '/repo_template/' back for frontend fetch calls as mentioned above
    await fetch(`/repo_template/${repoFile.path}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Assuming the server returns text content
        })
        .then(data => {
            repoFilesWithContents.push({
                path: repoFile.path,
                content: data
            })
        })
        .catch(error => {
            console.error('Error loading folder contents:', error);
        });
})
repoFiles.value = repoFilesWithContents

/*
 * Module-scoped: useDropboxFiles integration
 * 
 * This composable provides the underlying Dropbox API functionality.
 * Some methods are passed through directly, others are used internally.
 * 
 * Pass-through methods (returned directly by useDropboxFlogs):
 *  - launchConnectFlow
 *  - connectionPopupWindow  
 *  - openDbxPopup
 *  - hasConnection
 *  - accountOwner
 * 
 * Internal methods (used within useDropboxFlogs-specific logic):
 *  - clearConnection, availableFiles, availableRepoFiles
 *  - loadFileContent, saveFileContent, addFile, deleteFile
*/

const {
    launchConnectFlow,
    connectionPopupWindow,
    openDbxPopup,
    hasConnection,
    clearConnection: clearFileConnection,
    availableFiles,
    availableRepoFiles,
    loadFileContent,
    saveFileContent,
    addFile,
    deleteFile,
    accountOwner
} = useDropboxFiles(repoFiles.value)

/*
 * Module-scoped: TAGS INDEX management
 * 
 * Manages a centralized tag index file that tracks all tags across all user flogs.
 * The tag index is stored as a JSON file in the user's Dropbox app folder.
 */

// Tag index file configuration
const tagIndexFileName = "flogger.tag-index.json"
const tagIndexFilePath = "/" + tagIndexFileName

// Initialize tags composable with file path
const {
    tagIndex: tagIndex_useTags,
    setTagsIndex,
    getTagsForFlog,
    getTagsForFlogEntryDate,
    getFlogMapFromTags,
    tagHasFlogEntryDate
} = useTags({ file: tagIndexFilePath, rev: undefined })

// Create reactive reference to tag index and sync with useTags
const tagIndex = ref(tagIndex_useTags)
watch(
    tagIndex_useTags,
    () => {
        tagIndex.value = tagIndex_useTags.value
    },
    { immediate: true }
)

// Watch for connection status to load/create tag index file
watch(
    hasConnection,
    () => {
        if (hasConnection.value) {
            // Try to load existing tag index file from Dropbox
            loadFileContent(
                { path: tagIndexFilePath },
                handleTagIndexFileLoad
            )
        }
    },
    { immediate: true })

// Handle tag index file loading/creation
function handleTagIndexFileLoad(result: ILoadFileContentCallbackSuccess | ILoadFileContentCallbackError) {
    const { rev, content, error } = result
    if (error) {
        if (error == "file not found") {
            // Create new tag index file if it doesn't exist
            addFile({ path: tagIndexFileName, content: JSON.stringify([]) }, (result) => {
                // Initialize useTags with the newly created file
                setTagsIndex({
                    file: tagIndexFilePath,
                    rev: result.rev,
                    tagMap: [],
                })
            })
        }
        else {
            // Otherwise report the error
            console.log("TAGS Error creating tag index file for DropboxFlogs:", error)
        }
    } else {
        // If loaded, set the index for useTags
        let parsedTags = [];
        try {
            parsedTags = JSON.parse(content || '')
        } catch (error) {
            console.log("TAGS Error parsing tag index:", error)
        }
        setTagsIndex({
            file: tagIndexFilePath,
            rev,
            tagMap: [...parsedTags],
        })
    }
}

/*
 * Module-scoped: AVAILABLE FLOGS
 */

// Defining all ref variables at the module scope 
// (meaning at the root of this module file, 
// outside of the useComposable function that gets called by the importer),
// Creating ref variables at module scope makes them singletons shared by all composable importers.
// Otherwise, each composable importer gets its own instances of each ref variable.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
// Using module-scoped state requires special handling with SSR, if we ever want SSR.
// See https://vuejs.org/guide/scaling-up/state-management#simple-state-management-with-reactivity-api
const availableFlogs = ref<IDropboxFlog[]>([]);
const availableRepoFlogs = ref<IDropboxFlog[]>([]);

// Ref variables that are passed through from a specific use[SourceFilesSDK] composable
// need watchers on source variables
watch(
    availableFiles,
    // // Rather than merging the old and new values with this...
    // (newValue, oldValue) => {
    //     const removed = !oldValue ? [] : oldValue
    //         .filter((file) => newValue && !newValue.includes(file))
    //         .map<IDropboxFlog>((file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path } as IDropboxFlog))
    //     const added = !newValue ? [] : newValue
    //         .filter((file) => oldValue && !oldValue.includes(file))
    //         .map<IDropboxFlog>((file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path } as IDropboxFlog))
    //     const comparableAvailableFlogs = availableFlogs.value.map((flog) => ({ sourceType: flog.sourceType, url: flog.url } as IDropboxFlog))
    //     availableFlogs.value = comparableAvailableFlogs
    //         .filter((flog, i) => {
    //             const match = removed.filter((removedFlog) => removedFlog.sourceType == flog.sourceType && removedFlog.url == flog.url).length > 0
    //             return !match
    //         })
    //         .concat(added)
    // }
    // // We will just recreate availableFlogs with this...
    () => {
        availableFlogs.value = availableFiles.value.map<IDropboxFlog>(
            (file) => ({
                sourceType: IFlogSourceType.dropbox,
                url: file.path,
                modified: file.modified ? new Date(file.modified) : new Date(),
                rev: undefined,
                loadedEntries: []
            } as IDropboxFlog)
        )
    }
    ,
    { immediate: true }
)
watch(
    availableRepoFiles,
    () => {
        availableRepoFlogs.value = availableRepoFiles.value.map<IDropboxFlog>(
            (file) => ({ sourceType: IFlogSourceType.dropbox, url: file.path, readOnly: file.readOnly } as IDropboxFlog)
        )
    }
    ,
    { immediate: true }
)

export const useDropboxFlogs = (): IDropboxFlogs => {

    const loadFlogEntries = (flog: IDropboxFlog) => {
        loadFileContent(
            { path: flog.url },
            (result) => {
                const { rev, content } = result
                flog.rawContent = content
                flog.rev = rev;
                const { pretext, loadedEntries, status } = deserializeFlog(content || '')
                flog.status = status
                if (status != IFlogStatus.error) {
                    flog.pretext = pretext
                    const timestamp = Date.now()
                    flog.loadedEntries = loadedEntries.map((entry) => ({ ...entry, id: timestamp + '_' + entry.date.getTime() }))
                }
            }
        )
    }

    const saveFlogEntries = (flog: IDropboxFlog) => {
        // First save the flog file
        saveFileContent(
            {
                path: flog.url,
                rev: flog.rev,
                content: serializeFlog(flog.loadedEntries, flog.pretext)
            } as IDropboxFile,
            (result) => {
                // Update the flog with the new rev
                flog.rev = result.rev;

                // Second, parse tags in flog and save to tagIndex

                // // Parse content of entries for tags
                function parseTagsFromEntry(entry: IEntry): string[] {
                    const headings: string[] = parseHeadingsFromMarkdownString(entry.entry);
                    const headingsTags = headings.map(h => parseTagsFromString(h));
                    const tags = [...new Set<string>(headingsTags.flat())]
                    return tags
                }
                function parseTagsFromString(value: string): string[] {
                    return value.split(' ')
                }

                // Grab current tagMap
                const tagMap: Map<Tag['tag'], Tag['flogs']>
                    = new Map([...(tagIndex.value?.tagMap || [])]);
                // Build tagMap for current flog
                const thisFlogTagMap: Map<Tag['tag'], Tag['flogs']>
                    = new Map()
                flog.loadedEntries.forEach(entry => {
                    const entryTags = parseTagsFromEntry(entry)
                    entryTags.forEach(tag => {
                        // Need to get tag-flog-entries already added in previous iterations
                        // First get the tag-flogs
                        const existingTagFlogs = new Map(thisFlogTagMap.get(tag))
                        // Then get the tag-flog-entries
                        const existingTagFlogEntries = existingTagFlogs.get(flog.url) || [];
                        // Merge this entry into tag-flog-entries and de-dupe
                        const mergedTagFlogEntries = [...new Set([...existingTagFlogEntries, entry.date])];
                        // Save merged tag-flog-entries
                        thisFlogTagMap.set(tag, [[flog.url, mergedTagFlogEntries]])
                        // Since we're building a tagMap for this flog, each tag in the map
                        // will only ever have one flog entry, 
                        // which will have 1+ tag-flog-entries
                    })
                })
                // Merge thisFlogTagMap with tagIndex tagMap
                const mergedTagMap = new Map<Tag['tag'], Tag['flogs']>()
                const allTags = [...new Set([...tagMap.keys(), ...thisFlogTagMap.keys()])]
                allTags.forEach(tag => {
                    const existingTagFlogs = new Map(tagMap.get(tag))
                    const thisFlogTagFlogs = new Map(thisFlogTagMap.get(tag))
                    const thisFlogTagFlog = thisFlogTagFlogs.get(flog.url)
                    if (existingTagFlogs && thisFlogTagFlog) {
                        // update
                        const mergedTagFlogs = new Map(existingTagFlogs)
                        mergedTagFlogs.set(flog.url, thisFlogTagFlog)
                        mergedTagMap.set(tag, [...mergedTagFlogs] as Tag['flogs'])
                    } else if (existingTagFlogs && !thisFlogTagFlog) {
                        // remove
                        const mergedTagFlogs = new Map(existingTagFlogs)
                        mergedTagFlogs.delete(flog.url)
                        if (mergedTagFlogs.size == 0)
                            // remove tag if this flog was the only one using it
                            mergedTagMap.delete(tag)
                        else
                            mergedTagMap.set(tag, [...mergedTagFlogs] as Tag['flogs'])
                    } else if (!existingTagFlogs && thisFlogTagFlog) {
                        // add
                        mergedTagMap.set(tag, [...thisFlogTagFlogs] as Tag['flogs'])
                    }
                })

                // Update and save tagIndex
                if (tagIndex.value?.file && tagIndex?.value.rev) {
                    saveFileContent(
                        {
                            path: tagIndex.value.file,
                            rev: tagIndex.value.rev,
                            // content: JSON.stringify(tagIndex.value.tags)
                            content: JSON.stringify([...mergedTagMap], null, "\t")
                        },
                        (result) => {
                            // Then update tagIndex with new rev
                            setTagsIndex({
                                ...(tagIndex.value as TagIndex),
                                tagMap: [...mergedTagMap] as TagMap,
                                rev: result.rev,
                            })
                        } // can parameterize so calling app gets notice once save is complete 
                    )
                }

            } // can parameterize so calling app gets notice once save is complete 
        )
    }

    const addFlog = (flog: IDropboxFlog) => {
        addFile(
            {
                path: flog.url,
                // Is rev needed for mode add?
                // rev: flog.rev, 
                content: serializeFlog(flog.loadedEntries)
            } as IDropboxFile,
            // () => { } // can parameterize so calling app gets notice once save is complete 
        )
    }

    const deleteFlog = (flog: IDropboxFlog) => {
        deleteFile(
            {
                path: flog.url,
                rev: flog.rev
            } as IDropboxFile,
            // () => { } // can parameterize so calling app gets notice once delete is complete 
        )
    }

    const clearConnection = () => {
        clearFileConnection()
        availableFlogs.value = []
        availableRepoFlogs.value = []
    }

    return {
        launchConnectFlow,
        connectionPopupWindow,
        openDbxPopup,
        hasConnection,
        clearConnection,
        availableFlogs,
        availableRepoFlogs,
        loadFlogEntries,
        saveFlogEntries,
        addFlog,
        deleteFlog,
        accountOwner: accountOwner,
        tagIndex,
        getTagsForFlog,
        getTagsForFlogEntryDate,
        getFlogMapFromTags,
        tagHasFlogEntryDate,
    }
}
