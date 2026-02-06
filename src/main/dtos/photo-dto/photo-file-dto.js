class PhotoFileDto {
  constructor(files) {
    const arr = Array.isArray(files) ? files : [];
    this.files = arr.map(f => ({
      file_path: f.path ? "/" + String(f.path).replaceAll("\\", "/") : null
    })).filter(x => x.file_path);
  }

  isEmpty() {
    return !this.files || this.files.length === 0;
  }

  isNotEmpty() {
    return this.files && this.files.length > 0;
  }
}

module.exports = PhotoFileDto;
