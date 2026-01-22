class PhotoListResponseDto {
	constructor({row_num, id, title, thumbnail_path, created_at}) {
		this.row_num = row_num;
		this.id = id;
		this.title = title;
	    this.thumbnail_path = thumbnail_path;
		this.created_at = created_at;
	}
}

module.exports = PhotoListResponseDto;