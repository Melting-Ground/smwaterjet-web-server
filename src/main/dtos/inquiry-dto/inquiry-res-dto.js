class InquiryResponseDto {
    constructor(inquiry, files = []) {
        this.id = inquiry.id;
        this.author = inquiry.author;
        this.phone_number = inquiry.phone_number;
        this.title = inquiry.title;
        this.content = inquiry.content;
        this.created_at = inquiry.created_at;

        this.files = Array.isArray(files)
            ? files.map(file => ({
                id: file.id,
                file_path: file.file_path,
            }))
            : [];
    }
}

module.exports = InquiryResponseDto;