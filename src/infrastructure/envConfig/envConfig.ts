import { z } from 'zod';
import { IEnvConfig } from './envConfig.interface';
import { UserLocation } from '../../common/types/userLocation';

const configPropsSchema = z.object({
    dexcomPassword: z.string().min(1),
    dexcomUsername: z.string().min(1),
    dexcomApplicationId: z.string().min(1),
    dexcomUserLocation: z.nativeEnum(UserLocation),
    databaseHost: z.string().min(1),
    databasePort: z.number(),
    databaseUser: z.string().min(1),
    databasePassword: z.string().min(1),
    databaseName: z.string().min(1),
});

type ConfigProps = z.infer<typeof configPropsSchema>;

export class EnvConfig implements IEnvConfig {
    private readonly props: ConfigProps;

    private constructor() {
        const props = configPropsSchema.parse({
            dexcomPassword: process.env['DEXCOM_PASSWORD'],
            dexcomUsername: process.env['DEXCOM_USERNAME'],
            dexcomApplicationId: process.env['DEXCOM_APPLICATION_ID'],
            dexcomUserLocation: process.env['DEXCOM_USER_LOCATION'],
            databaseHost: process.env['DATABASE_HOST'],
            databasePort: process.env['DATABASE_PORT'],
            databaseUser: process.env['DATABASE_USER'],
            databasePassword: process.env['DATABASE_PASSWORD'],
            databaseName: process.env['DATABASE_NAME'],
        });

        this.props = props;
    }

    getDexcomUserLocation(): UserLocation {
        return this.props.dexcomUserLocation;
    }

    public static async factory(): Promise<IEnvConfig> {
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
            const { config } = await import('dotenv');

            config({
                path: process.env['NODE_ENV'] === 'test' ? './.env.test' : './.env',
            });
        }

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

    getDexcomApplicationId(): string {
        return this.props.dexcomApplicationId;
    }
}
