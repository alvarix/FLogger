import { ref, unref } from "vue"
import type { Ref } from "vue"
import type { TagIndex, ITag, TagRev, ITagIndex, ITagFlogEntryPointer, TagFlogTuple } from "@modules/Tag"


export type { TagIndex as TagIndex }
export type { TagRev as TagRev }
export type { ITag as ITag };

export interface ITagsComposable {
    tagIndex: Ref<TagIndex | undefined>
    setTagsIndex: (newTagIndex: TagIndex, callback?: ICallback) => void,
    getFlogTags: (flogFile: ITagFlogEntryPointer['file']) => TagIndex['tagMap'],
}

export const useTags = (starterIndex?: TagIndex): ITagsComposable => {
    const tagIndex = ref<ITagIndex | undefined>(starterIndex)

    const setTagsIndex = (newTagIndex: TagIndex, callback?: ICallback) => {
        console.log('New tag index', newTagIndex.rev);
        tagIndex.value = {
            tagMap: unref(newTagIndex.tagMap),
            tags: unref(newTagIndex.tags),
            rev: unref(newTagIndex.rev),
            file: unref(newTagIndex.file),
        }

        // Save to persistent state storage here. 
        // localStorage is simple enough for now?
        if (callback) callback({ rev: tagIndex.value.rev })
    }

    const getFlogTags = (flogFile: ITagFlogEntryPointer['file']) => {
        const mapWithTagsFiltered: TagIndex['tagMap'] =
            (tagIndex.value?.tagMap?.filter(
                ([, tagFlogs]) =>
                    // true if this tag contains an entry for this flog
                    tagFlogs.map(
                        ([file]) => file
                    ).includes(flogFile))) || [];
        const mapWithTagsFilteredAndFlogRemoved: TagIndex['tagMap'] = (
            mapWithTagsFiltered?.map(
                ([tag, tagFlogs]) => {
                    const shortFlogs: TagFlogTuple[] = tagFlogs.filter(
                        ([file]) => (file != flogFile)
                    )
                    return [
                        tag,
                        shortFlogs
                    ]
                }
            )
        ) || [];
        console.log('TAGS mapWithTagsFiltered, mapWithTagsFilteredAndFlogRemoved', mapWithTagsFiltered, mapWithTagsFilteredAndFlogRemoved);
        // return mapWithTagsFilteredAndFlogRemoved
        return mapWithTagsFiltered
    }

    return {
        tagIndex,
        setTagsIndex,
        getFlogTags,
    }
}

type ICallback = (result: { rev?: TagRev, file?: string }) => void

