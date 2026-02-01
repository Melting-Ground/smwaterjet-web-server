const db = require('@configs/knex');

const createSearchQuery = (tableName, searchParams) => {
	let searchQuery = db(tableName);
    const { searchBy, query } = searchParams;

	if (searchBy === 'title') {
		searchQuery = searchQuery.where('title', 'like', `%${query}%`);
		return searchQuery;
	}
	if (searchBy === 'author') {
		searchQuery = searchQuery.where('author', 'like', `%${query}%`);
		return searchQuery;
	}
	if (searchBy === 'content') {
		searchQuery = searchQuery.where('content', 'like', `%${query}%`);
		return searchQuery;
	}
	searchQuery = searchQuery.where(function () {
		this.where('title', 'like', `%${query}%`)
			.orWhere('author', 'like', `%${query}%`)
			.orWhere('content', 'like', `%${query}%`);
	});
	return searchQuery;
};

module.exports = createSearchQuery;