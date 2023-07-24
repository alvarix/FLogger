export default class NoteData {
  date: Date;
  tags: [string];
  entry: string;

  constructor(date: Date, tags: [string], entry: string) {
    this.date = date;
    this.tags = tags;
    this.entry = entry;
  }
}
