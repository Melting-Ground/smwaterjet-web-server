class NoticeResponseDto {
    constructor({ id, author, title, content, created_at }, files = []) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.content = content;
        this.files = Array.isArray(files) ? files : [];
        this.created_at = created_at;
    }
}

module.exports = NoticeResponseDto;