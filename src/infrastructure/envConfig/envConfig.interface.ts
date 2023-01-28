import { IEnvDexcomConfig } from '../services/dexcomService/envDexcomConfig.interface';
import { IDbClientEnvConfig } from '../database/client/dbClientEnvConfig.inteface';
import { IApplicationEnvConfig } from '../../application/config/applicationEnvConfig.interface';
import { Environment } from '../../common/types/environment';

export interface IEnvConfig
    extends IEnvDexcomConfig,
        IDbClientEnvConfig,
        IApplicationEnvConfig {
    getEnvironment: () => Environment;
}
