import { Knex, knex } from 'knex';
import { IEnvDatabaseConfig } from './envDatabaseConfig.inteface';

export type IDbClient = Knex;

export class DbClientFactory {
    public constructor(
        private readonly envDatabaseConfig: IEnvDatabaseConfig,
    ) {}

    public create(): IDbClient {
        const [
            databasePassword,
            databasePort,
            databaseHost,
            databaseName,
            databaseUser,
        ] = [
            this.envDatabaseConfig.getDatabasePassword(),
            this.envDatabaseConfig.getDatabasePort(),
            this.envDatabaseConfig.getDatabaseHost(),
            this.envDatabaseConfig.getDatabaseName(),
            this.envDatabaseConfig.getDatabaseUser(),
        ];

        return knex({
            client: 'pg',
            connection: {
                host: databaseHost,
                port: databasePort,
                user: databaseUser,
                password: databasePassword,
                database: databaseName,
            },
        });
    }
}
