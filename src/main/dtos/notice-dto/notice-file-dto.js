class NoticeFileDto {
    constructor(paths) {
        const arr = Array.isArray(paths) ? paths : [];
        this.paths = arr.map(file => ({
            path: file.path ? "/" + String(file.path).replaceAll("\\", "/") : null,
        })).filter(file => file.path);
    }
    isEmpty() {
        return !Array.isArray(this.paths) || this.paths.length === 0;
    }

    isNotEmpty() {
        return Array.isArray(this.paths) && this.paths.length > 0;
    }
}

module.exports = NoticeFileDto;
