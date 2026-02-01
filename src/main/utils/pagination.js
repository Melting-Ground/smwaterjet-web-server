class Pagination {
	constructor(page, limit) {
		this.page = parseInt(page) || 1;
		this.limit = parseInt(limit) || 10;

		if (this.page < 1) {
			this.page = 1;
		}
		if (this.limit < 1) {
			this.limit = 10;
		}
	}

	getOffset() {
		return (this.page - 1) * this.limit;
	}
	
	getPaginationInfo(totalItems) {
		const lastPage = Math.ceil(totalItems / this.limit);

		return {
			currentPage: this.page,
			lastPage,
			totalItems,
			limit: this.limit,
			hasNextPage: this.page < lastPage,
			hasPreviousPage: this.page > 1,
		};
	}
}

module.exports = Pagination;
