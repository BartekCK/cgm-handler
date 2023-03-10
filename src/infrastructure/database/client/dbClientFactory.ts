import { Knex, knex } from 'knex';
import { IDbClientEnvConfig } from './dbClientEnvConfig.inteface';
import { IDbClient } from './dbClient.interface';

export class DbClientFactory {
    public constructor(private readonly envDatabaseConfig: IDbClientEnvConfig) {}

    public createDbClient(config?: Partial<Knex.Config>): IDbClient {
        const [
            databasePassword,
            databasePort,
            databaseHost,
            databaseName,
            databaseUser,
            environment,
        ] = [
            this.envDatabaseConfig.getDatabasePassword(),
            this.envDatabaseConfig.getDatabasePort(),
            this.envDatabaseConfig.getDatabaseHost(),
            this.envDatabaseConfig.getDatabaseName(),
            this.envDatabaseConfig.getDatabaseUser(),
            this.envDatabaseConfig.getEnvironment(),
        ];

        return knex({
            client: 'pg',
            connection: {
                host: databaseHost,
                port: databasePort,
                user: databaseUser,
                password: databasePassword,
                database: databaseName,
                ssl: environment === 'production',
            },
            ...config,
        });
    }
}
