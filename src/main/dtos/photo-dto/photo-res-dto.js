class PhotoResponseDto {
    constructor({ id, title, created_at }, files = []) {
        this.id = id;
        this.title = title;
        this.files = Array.isArray(files) ? files : [];
        this.created_at = created_at;
    }
}

module.exports = PhotoResponseDto;