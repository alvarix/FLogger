export default class NoteData {
	date;
	tags;
	entry;

  constructor(date, tags, entry) {
    this.date = date;
    this.tags = tags;
    this.entry = entry;
  }
}