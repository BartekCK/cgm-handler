import { Environment } from '../../../common/types/environment';

export interface IDbClientEnvConfig {
    getDatabaseHost: () => string;
    getDatabasePort: () => number;
    getDatabaseUser: () => string;
    getDatabasePassword: () => string;
    getDatabaseName: () => string;
    getEnvironment: () => Environment;
}
