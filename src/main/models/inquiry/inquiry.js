class Inquiry {
    constructor({author, password, phone_number, title, content}) {
        this.author = author;
        this.password = password;
        this.phone_number = phone_number;
        this.title = title;
        this.content = content;
    }
}

module.exports = Inquiry;