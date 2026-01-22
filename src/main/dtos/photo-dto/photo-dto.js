class PhotoDto {
  constructor({ title, thumbnail_path }) {
    this.title = title;
    this.thumbnail_path = thumbnail_path;
  }
}

module.exports = PhotoDto;