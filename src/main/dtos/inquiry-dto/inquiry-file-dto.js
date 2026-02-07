class InquiryFileDto {
    constructor(paths) {
        const arr = Array.isArray(paths) ? paths : [];
        this.paths = arr.map(file => {
            if (!file.path) return null;
            const localPath = String(file.path).replaceAll("\\", "/");
            const publicPath = "/" + localPath.replace(/^\/+/, "");
            return {
                path: publicPath,
                local_path: localPath,
                mime_type: file.mimetype,
                original_name: file.originalname,
            };
        }).filter(Boolean);
    }
    isEmpty() {
        return !Array.isArray(this.paths) || this.paths.length === 0;
    }

    isNotEmpty() {
        return Array.isArray(this.paths) && this.paths.length > 0;
    }
}

module.exports = InquiryFileDto;
