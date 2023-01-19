import { DbClientFactory } from './src/infrastructure/database/client/dbClientFactory';
import { IDbClientEnvConfig } from './src/infrastructure/database/client/dbClientEnvConfig.inteface';
import { EnvConfig } from './src/infrastructure/envConfig/envConfig';
import * as dotenv from 'dotenv';
dotenv.config();

const config: IDbClientEnvConfig = EnvConfig.factory();

const dbClient = new DbClientFactory(config);

export default dbClient.create({
    migrations: { directory: './src/infrastructure/database/migrations' },
});
