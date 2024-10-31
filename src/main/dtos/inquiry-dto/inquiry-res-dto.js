class InquiryResponseDto {
    constructor(inquiry, files = []) {
        this.id = inquiry.id;
        this.author = inquiry.author;
        this.phone_number = inquiry.phone_number;
        this.email = inquiry.email;
        this.title = inquiry.title;
        this.content = inquiry.content;
        this.files = Array.isArray(files) ? files : [];
        this.created_at = inquiry.created_at;
    }
}

module.exports = InquiryResponseDto;