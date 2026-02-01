class NoticeFileDto {
    constructor(paths) {
        this.paths = Array.isArray(paths) ? paths : [];
    }
    isEmpty() {
        return !Array.isArray(this.paths) || this.paths.length === 0;
    }

    isNotEmpty() {
        return Array.isArray(this.paths) && this.paths.length > 0;
    }
}

module.exports = NoticeFileDto;