import { ref, unref } from "vue"
import type { Ref } from "vue"
import type { TagIndex, TagMap, Tag, TagIndexRev, TagFlogFile } from "@modules/Tag"


export type { TagIndex as TagIndex }
export type { TagMap as TagMap }
export type { TagIndexRev as TagIndexRev }
export type { Tag as Tag };
export type { TagFlogFile as TagFlogFile }

export interface ITagsComposable {
    tagIndex: Ref<TagIndex | undefined>
    setTagsIndex: (newTagIndex: TagIndex, callback?: ICallback) => void,
    getFlogTags: (flogFile: TagFlogFile) => TagMap,
}

export const useTags = (starterIndex?: TagIndex): ITagsComposable => {
    const tagIndex = ref<TagIndex | undefined>(starterIndex)

    const setTagsIndex = (newTagIndex: TagIndex, callback?: ICallback) => {
        console.log('New tag index', newTagIndex.rev);
        tagIndex.value = {
            tagMap: unref(newTagIndex.tagMap),
            rev: unref(newTagIndex.rev),
            file: unref(newTagIndex.file),
        }

        // Save to persistent state storage here. 
        // localStorage is simple enough for now?
        if (callback) callback({ rev: tagIndex.value.rev })
    }

    const getFlogTags = (flogFile: TagFlogFile) => {
        const mapWithTagsFiltered: TagMap =
            (tagIndex.value?.tagMap?.filter(
                ([, tagFlogs]) =>
                    // true if this tag contains an entry for this flog
                    tagFlogs.map(
                        ([file]) => file
                    ).includes(flogFile))) || [];
        const mapWithTagsFilteredAndFlogRemoved: TagMap = (
            mapWithTagsFiltered?.map(
                ([tag, tagFlogs]) => {
                    const shortFlogs: Tag['flogs'] = tagFlogs.filter(
                        ([file]) => (file != flogFile)
                    )
                    return [
                        tag,
                        shortFlogs
                    ]
                }
            )
        ) || [];
        console.log("TAGS mapWithTagsFiltered, mapWithTagsFilteredAndFlogRemoved", mapWithTagsFiltered, mapWithTagsFilteredAndFlogRemoved);
        // return mapWithTagsFilteredAndFlogRemoved
        return mapWithTagsFiltered
    }

    return {
        tagIndex,
        setTagsIndex,
        getFlogTags,
    }
}

type ICallback = (result: { rev?: TagIndexRev, file?: string }) => void

