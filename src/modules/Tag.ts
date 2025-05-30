import type { IFlog, IEntry } from "./Flog";

/*
 * Describes the type for an index of Tags
 * 
 * @property file - A unique flog identifier. 
 *                  Right now this is just a dropbox path. But could do better.
 * @property rev - A revision number for syncing with storage
 * @property tagMap - This is a map of tag values to all flog entries containing the tag
 * 
 * This is implemented using nested arrays of tuples. 
 * 
 * The shape:
 *          TagIndex {
 *              file string
 *              rev string
 *              tagMap array[
 *                  tuple[
 *                      tag string,
 *                      array[
 *                          tuple[
 *                              flogFile string,
 *                              array[entry]
 *                          ]
 *                      ]
 *                  ]
 *              ]
 *          }
 * 
 * The reason arrays of tuples are used, in general and specifically instead of Maps:
 * 
 *      - A [tag, array] tuple can be used to describe a map of arrays per each unique tag
 * 
 *      - The tuple is easier to filter than a Map, since the Array.prototype.map and .filter 
 *        methods are available. Whereas a Map object doesn't have any chaining iterators.
 * 
 *      - CON: The tuple doesn't enforce unique tag keys. 
 * 
 *          Exact [tag, array] matches can be easily de-duped using 
 *              [...new Set( ...( arrayOfTuples ) )]  
 *          But any [tag, array1] and [tag, array2] entries are not de-duped.
 * 
 *          Entries with the same tag but different arrays can be aggressively de-duped using 
 *              [...new Map( ...( arrayOfTuples ) )]
 *          This keeps the last [tag, *] for any given tag, and discards the preceding ones.
 * 
 *          (In both examples, arrayOfTuples is the array of tuples: [[tag, array],[tag, array]...] )
 * 
 *          But neither tuple arrays, nor Maps, nor Sets can be easily merged to combine duplicate
 *          [tag, *] entries. Tuple arrays can be easily converted into Maps in order to perform 
 *          operations like merging
 * 
 *      - See Map Relations with Array Objects here: 
 *          https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#relation_with_array_objects
 * 
 */
export type TagIndex = {
    file: TagFlogFile;
    rev: TagIndexRev | undefined;
    tagMap?: TagMap;
}

/*
 *
 */
export type TagMap = TagTuple[] // Instead of Map<Tag['tag'], Tag['flogs']>
export type TagFlogMap = TagFlogTuple[]

/*
 * Abstract Tag model
 * Tag['flogs'] can be used to reference the TagFlogTuple[] type, which is used in TagTuple
 */
export type Tag = {
    tag: TagValue;
    flogs: TagFlogMap
}

/*
 * Primative types.
 * Using properties of IFlog and IEntry to match those types
 */
export type TagValue = string
export type TagIndexRev = string
export type TagFlogFile = IFlog['url']
export type TagEntryDate = IEntry['date']

/*
 * Tuple used to map a single tag to flogs with entries containing the tag
 */
type TagTuple = [Tag['tag'], TagFlogMap]
/*
 * Tuple used to map a single flog (identified by a "file" string) to entries containing the same tag
 */
type TagFlogTuple = [TagFlogFile, TagEntryDate[]]


