import { IDbClientEnvConfig } from './src/infrastructure/database/client/dbClientEnvConfig.inteface';
import { EnvConfig } from './src/infrastructure/envConfig/envConfig';

export default async () => {
    const config: IDbClientEnvConfig = await EnvConfig.factory();

    const [
        databasePassword,
        databasePort,
        databaseHost,
        databaseName,
        databaseUser,
        environment,
    ] = [
        config.getDatabasePassword(),
        config.getDatabasePort(),
        config.getDatabaseHost(),
        config.getDatabaseName(),
        config.getDatabaseUser(),
        config.getEnvironment(),
    ];

    return {
        client: 'pg',
        connection: {
            host: databaseHost,
            port: databasePort,
            user: databaseUser,
            password: databasePassword,
            database: databaseName,
            ssl: environment === 'production',
        },
        migrations: {
            directory: './src/infrastructure/database/migrations',
        },
    };
};
