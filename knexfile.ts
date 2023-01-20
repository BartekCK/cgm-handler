import { IDbClientEnvConfig } from './src/infrastructure/database/client/dbClientEnvConfig.inteface';
import { EnvConfig } from './src/infrastructure/envConfig/envConfig';

export default async () => {
    const config: IDbClientEnvConfig = await EnvConfig.factory();

    const [databasePassword, databasePort, databaseHost, databaseName, databaseUser] = [
        config.getDatabasePassword(),
        config.getDatabasePort(),
        config.getDatabaseHost(),
        config.getDatabaseName(),
        config.getDatabaseUser(),
    ];

    console.log(config);

    return {
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
};
