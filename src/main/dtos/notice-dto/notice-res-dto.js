class NoticeResponseDto {
    constructor(notice, files = []) {
        this.id = notice.id;
        this.author = notice.author;
        this.title = notice.title;
        this.content = notice.content;
        this.created_at = notice.created_at;

        this.files = Array.isArray(files)
            ? files.map(file => ({
                id: file.id,
                file_path: file.file_path,
            }))
            : [];
    }
}

module.exports = NoticeResponseDto;