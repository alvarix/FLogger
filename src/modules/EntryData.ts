/**
 * An interface an Entry
 * @public
 */
export interface IEntry extends EntryData {
  // eslint-disable-next-line
  id?: any
}

/**
 * A class for the core EntryData
 * @public
 */
export default class EntryData {
  /** 
   * The datetime of the entry
   * 
   * @remarks 
   * This should probably be a public getter
   */
  date: Date;
  /** 
   * The entry text
   * 
   * @remarks 
   * This should probably be a public getter
   */
  entry: string;
  /** 
   * A constructor 
   * 
   * @param date
   * @param entry
   */
  constructor(date: Date, entry: string) {
    this.date = date;
    this.entry = entry;
  }
}