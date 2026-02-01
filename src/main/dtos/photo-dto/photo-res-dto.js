class PhotoResponseDto {
    constructor(photo, files = []) {
        this.id = photo.id;
        this.title = photo.title;
        this.thumbnail_path = photo.thumbnail_path;
        this.created_at = photo.created_at;

        this.files = Array.isArray(files)
            ? files.map(file => ({
                id: file.id,
                file_path: file.file_path,
            }))
            : [];
    }
}

module.exports = PhotoResponseDto;