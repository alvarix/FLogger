export interface INote extends NoteData {}

export default class NoteData {
  date: Date;
  entry: string;

  constructor(date: Date, entry: string) {
    this.date = date;
    this.entry = entry;
  }
}