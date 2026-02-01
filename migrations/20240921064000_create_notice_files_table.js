/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('notice_files', function(table) {
        table.increments('id').primary(); 
        table.integer('notice_id').unsigned().notNullable(); 
        table.string('file_path').notNullable(); 
        table.foreign('notice_id').references('id').inTable('notices').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notice_files'); 
};
