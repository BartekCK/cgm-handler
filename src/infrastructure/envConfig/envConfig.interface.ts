import { IEnvDexcomConfig } from '../services/dexcomService/envDexcomConfig.interface';
import { IDbClientEnvConfig } from '../database/client/dbClientEnvConfig.inteface';
import { IApplicationEnvConfig } from '../../application/config/applicationEnvConfig.interface';

export interface IEnvConfig
    extends IEnvDexcomConfig,
        IDbClientEnvConfig,
        IApplicationEnvConfig {}
