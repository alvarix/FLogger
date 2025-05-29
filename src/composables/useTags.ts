import { ref, unref } from "vue"
import type { Ref } from "vue"
import type { TagIndex, TagMap, Tag, TagIndexRev, TagFlogFile, TagValue, TagEntryDate } from "@modules/Tag"


export type { TagIndex as TagIndex }
export type { TagMap as TagMap }
export type { TagIndexRev as TagIndexRev }
export type { Tag as Tag };
export type { TagFlogFile as TagFlogFile }
export type { TagEntryDate as TagEntryDate }

export interface ITagsComposable {
    tagIndex: Ref<TagIndex | undefined>
    setTagsIndex: (newTagIndex: TagIndex, callback?: ICallback) => void,
    getTagsForFlog: (flogFile: TagFlogFile) => TagMap,
    getTagsForFlogEntryDate: (flogFile: TagFlogFile, entryDate: TagEntryDate) => Tag['tag'][],
    tagHasFlogEntryDate: (tag: TagValue, flogFile: TagFlogFile, entryDate: TagEntryDate) => boolean,
}

const tagIndex = ref<TagIndex | undefined>()

export const useTags = (starterIndex?: TagIndex): ITagsComposable => {
    if (!tagIndex.value && starterIndex) tagIndex.value = starterIndex

    const setTagsIndex = (newTagIndex: TagIndex, callback?: ICallback) => {
        tagIndex.value = {
            tagMap: unref(newTagIndex.tagMap),
            rev: unref(newTagIndex.rev),
            file: unref(newTagIndex.file),
        }

        // Save to persistent state storage here. 
        // localStorage is simple enough for now?
        if (callback) callback({ rev: tagIndex.value.rev })
    }

    const getTagsForFlog = (flogFile: TagFlogFile) => {
        const mapWithTagsFiltered: TagMap =
            (tagIndex.value?.tagMap?.filter(
                ([, tagFlogs]) =>
                    // true if this tag contains an entry for this flog
                    tagFlogs.map(
                        ([file]) => file
                    ).includes(flogFile))) || [];
        // const mapWithTagsFilteredAndFlogRemoved: TagMap = (
        //     mapWithTagsFiltered?.map(
        //         ([tag, tagFlogs]) => {
        //             const shortFlogs: Tag['flogs'] = tagFlogs.filter(
        //                 ([file]) => (file != flogFile)
        //             )
        //             return [
        //                 tag,
        //                 shortFlogs
        //             ]
        //         }
        //     )
        // ) || [];
        // return mapWithTagsFilteredAndFlogRemoved
        return mapWithTagsFiltered
    }

    const getTagsForFlogEntryDate = (flogFile: TagFlogFile, entryDate: TagEntryDate) => {
        const mapWithTagsFiltered: Tag['tag'][] | undefined =
            (tagIndex.value?.tagMap?.filter(
                ([, tagFlogs]) =>
                    // true if this tag contains an entry for this flogFile with the entryDate
                    tagFlogs.filter(
                        ([file, entryDates]) => file == flogFile && 0 < entryDates.filter((thisEntryDate) => {
                            const entryDateDate = new Date(entryDate)
                            const thisEntryDateDate = new Date(thisEntryDate)
                            return entryDateDate.getTime()==thisEntryDateDate.getTime()
                        }).length
                    ).length > 0
            ))?.map(([tag]) => tag) || [];
        return mapWithTagsFiltered as Tag['tag'][]
    }

    const tagHasFlogEntryDate = (tag: TagValue, flogFile: TagFlogFile, entryDate: TagEntryDate) => {
        const tagFlogs = (new Map(tagIndex.value?.tagMap || [])).get(tag) || [];

        const flogTagFlog = tagFlogs.filter(
            ([tagFlogFile]) => tagFlogFile == flogFile
        );

        const tagFlogEntryDates = flogTagFlog
            .map(([, tagFlogEntryDates]) =>
                tagFlogEntryDates.map((tagFlogEntryDate) => (new Date(tagFlogEntryDate)).toDateString())
            )
            .flat();

        const entryMatch = tagFlogEntryDates.includes(
            entryDate.toDateString()
        );

        return entryMatch;
    }

    return {
        tagIndex,
        setTagsIndex,
        getTagsForFlog,
        getTagsForFlogEntryDate,
        tagHasFlogEntryDate,
    }
}

type ICallback = (result: { rev?: TagIndexRev, file?: string }) => void

