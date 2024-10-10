export interface IEntry extends EntryData {}

export default class EntryData {
  date: Date;
  entry: string;

  constructor(date: Date, entry: string) {
    this.date = date;
    this.entry = entry;
  }
}