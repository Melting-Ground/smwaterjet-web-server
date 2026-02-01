/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('inquiry_files', function(table) {
        table.increments('id').primary(); 
        table.integer('inquiry_id').unsigned().notNullable();
        table.string('file_path').notNullable(); 
        table.foreign('inquiry_id').references('id').inTable('inquiries').onDelete('CASCADE'); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('inquiry_files');
};
