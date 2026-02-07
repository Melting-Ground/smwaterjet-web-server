class PhotoFileDto {
  constructor(files) {
    const arr = Array.isArray(files) ? files : [];
    this.files = arr.map(f => {
      if (!f.path) return null;
      const localPath = String(f.path).replaceAll("\\", "/");
      const publicPath = "/" + localPath.replace(/^\/+/, "");
      return {
        file_path: publicPath,
        local_path: localPath,
        mime_type: f.mimetype,
        original_name: f.originalname,
      };
    }).filter(Boolean);
  }

  isEmpty() {
    return !this.files || this.files.length === 0;
  }

  isNotEmpty() {
    return this.files && this.files.length > 0;
  }
}

module.exports = PhotoFileDto;
