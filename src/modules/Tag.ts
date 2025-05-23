import type { IEntry } from "./EntryData";
export type TagRev = string

export type TagIndex = ITagIndex

export type TagTuple = [ITag['tag'], TagFlogTuple[] ]
export type TagMap = TagTuple[] // Instead of Map<ITag['tag'], ITag['flogs']>

export type TagFlogTuple = [ITagFlogEntryPointer['file'], ITagFlogEntryPointer['entryDates']]

export interface ITag {
    tag: string;
    flogs: ITagFlogEntryPointer[]
}

export interface ITagFlogEntryPointer {
    file: string;
    entryDates: IEntry['date'][]; // An array of IEntry.date properties
}

export interface ITagIndex {
    file: string;
    rev: TagRev | undefined;
    tags?: ITag[];
    tagMap?: TagMap;
}
