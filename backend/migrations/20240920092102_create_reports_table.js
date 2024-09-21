/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('reports', function(table) {
        table.increments('id').primary(); 
        table.string('title').notNullable();
        table.year('report_year').notNullable(); 
        table.timestamp('updated_at').defaultTo(knex.fn.now()).onUpdate(knex.fn.now()); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('reports');
};