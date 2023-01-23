import { z } from 'zod';
import { IEnvConfig } from './envConfig.interface';
import { UserLocation } from '../../common/types/userLocation';

const configPropsSchema = z.object({
    dexcomPassword: z.string(),
    dexcomUsername: z.string(),
    dexcomApplicationId: z.string(),
    dexcomUserLocation: z.nativeEnum(UserLocation),
    databaseHost: z.string(),
    databasePort: z.number(),
    databaseUser: z.string(),
    databasePassword: z.string(),
    databaseName: z.string(),
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
            databasePort: Number(process.env['DATABASE_PORT']),
            databaseUser: process.env['DATABASE_USER'],
            databasePassword: process.env['DATABASE_PASSWORD'],
            databaseName: process.env['DATABASE_NAME'],
        });

        console.log(props);

        this.props = props;
    }

    getDexcomUserLocation(): UserLocation {
        return this.props.dexcomUserLocation;
    }

    public static async factory(): Promise<IEnvConfig> {
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
            const { config } = await import('dotenv');
            console.log(process.cwd());
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
