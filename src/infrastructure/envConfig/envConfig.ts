import { IEnvDexcomConfig } from '../../application/config/envConfig/envDexcomConfig.interface';
import { z } from 'zod';
import { IEnvDatabaseConfig } from '../database/client';

const configPropsSchema = z.object({
    dexcomPassword: z.string(),
    dexcomUsername: z.string(),
    databaseHost: z.string(),
    databasePort: z.number(),
    databaseUser: z.string(),
    databasePassword: z.string(),
    databaseName: z.string(),
});

type ConfigProps = z.infer<typeof configPropsSchema>;

interface IEnvConfig extends IEnvDexcomConfig, IEnvDatabaseConfig {}

export class EnvConfig implements IEnvConfig {
    private readonly props: ConfigProps;

    private constructor() {
        const props = configPropsSchema.parse({
            dexcomPassword: process.env['DEXCOM_PASSWORD'],
            dexcomUsername: process.env['DEXCOM_USERNAME'],
            databaseHost: process.env['DATABASE_HOST'],
            databasePort: process.env['DATABASE_PORT'],
            databaseUser: process.env['DATABASE_USER'],
            databasePassword: process.env['DATABASE_PASSWORD'],
            databaseName: process.env['DATABASE_NAME'],
        });

        this.props = props;
    }

    public static factory(): IEnvConfig {
        return new EnvConfig();
    }

    public getDexcomPassword(): string {
        return this.props.dexcomPassword;
    }

    public getDexcomUsername(): string {
        return this.props.dexcomUsername;
    }

    getDatabaseHost(): string {
        return this.props.databaseHost;
    }

    getDatabaseName(): string {
        return this.props.databaseName;
    }

    getDatabasePassword(): string {
        return this.props.databasePassword;
    }

    getDatabasePort(): number {
        return this.props.databasePort;
    }

    getDatabaseUser(): string {
        return this.props.databaseUser;
    }
}
