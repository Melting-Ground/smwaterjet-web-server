/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.raw(`
        CREATE OR REPLACE VIEW notices_view AS
        SELECT 
            ROW_NUMBER() OVER (ORDER BY id) AS row_num,
            id,
			author,
			title,
			content,
			created_at
        FROM 
            notices
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.raw(`DROP VIEW IF EXISTS notices_view`);
};
