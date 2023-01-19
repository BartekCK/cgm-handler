import { DbClientFactory } from './src/infrastructure/database/client/dbClientFactory';
import { IDbClientEnvConfig } from './src/infrastructure/database/client/dbClientEnvConfig.inteface';
import { EnvConfig } from './src/infrastructure/envConfig/envConfig';
import * as dotenv from 'dotenv';
dotenv.config();

const config: IDbClientEnvConfig = EnvConfig.factory();

const dbClient = new DbClientFactory(config);

const [databasePassword, databasePort, databaseHost, databaseName, databaseUser] = [
    config.getDatabasePassword(),
    config.getDatabasePort(),
    config.getDatabaseHost(),
    config.getDatabaseName(),
    config.getDatabaseUser(),
];

export default {
    client: 'pg',
    connection: {
        host: databaseHost,
        port: databasePort,
        user: databaseUser,
        password: databasePassword,
        database: databaseName,
    },
    migrations: {
        directory: './src/infrastructure/database/migrations',
    },
};
