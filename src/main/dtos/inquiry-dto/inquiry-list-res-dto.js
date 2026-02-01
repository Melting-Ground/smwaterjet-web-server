class InquiryListResponseDto {
    constructor({row_num, id, author, title, created_at }) {
        this.row_num = row_num;
        this.id = id;
        this.author = author;
        this.title = title;
        this.created_at = created_at;
    }
}

module.exports = InquiryListResponseDto;