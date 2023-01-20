import { Knex } from 'knex';
import { CGM_GLUCOSE_TABLE_NAME } from '../../repositories/cgmGlucoseRepository/cgmGlucoseRepository';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(CGM_GLUCOSE_TABLE_NAME, (table) => {
        table.uuid('id', { primaryKey: true });
        table.integer('value').nullable();
        table
            .datetime('valueDate')
            .notNullable()
            .index('cgm_glucose_value_date_index')
            .unique();
        table.string('trend').notNullable();

        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable(CGM_GLUCOSE_TABLE_NAME);
}
