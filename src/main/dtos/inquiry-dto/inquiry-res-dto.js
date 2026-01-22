class InquiryResponseDto {
    constructor({ id, author, phone_number, title, content, created_at }, files = []) {
        this.id = id;
        this.author = author;
        this.phone_number = phone_number;
        this.title = title;
        this.content = content;
        this.files = Array.isArray(files) ? files : [];
        this.created_at = created_at;
    }
}

module.exports = InquiryResponseDto;