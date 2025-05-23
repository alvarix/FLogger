import type { IFlog } from "./Flog";
import type { IEntry } from "./EntryData";
export type TagRev = string

export type TagIndex = {
    file: TagFlogFile;
    rev: TagRev | undefined;
    tagMap?: TagMap;
}

export type TagTuple = [Tag['tag'], TagFlogTuple[] ]
export type TagMap = TagTuple[] // Instead of Map<Tag['tag'], Tag['flogs']>

export type TagFlogTuple = [TagFlogEntryPointer['file'], TagFlogEntryPointer['entryDates']]

export type Tag = {
    tag: string;
    flogs: TagFlogEntryPointer[]
}

export type TagFlogEntryPointer = {
    file: TagFlogFile;
    entryDates: TagEntryDate[]; // An array of IEntry.date properties
}

export type TagFlogFile = IFlog['url']
export type TagEntryDate = IEntry['date']
