/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('photo_files', function(table) {
        table.increments('id').primary(); 
        table.integer('photo_id').unsigned().notNullable();
        table.string('file_path').notNullable(); 
        table.foreign('photo_id').references('id').inTable('photos').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('photo_files'); 
};

