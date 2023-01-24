export interface IDbClientEnvConfig {
    getDatabaseHost: () => string;
    getDatabasePort: () => number | undefined;
    getDatabaseUser: () => string;
    getDatabasePassword: () => string;
    getDatabaseName: () => string;
}
