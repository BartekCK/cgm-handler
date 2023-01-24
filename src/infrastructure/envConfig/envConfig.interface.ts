import { IEnvDexcomConfig } from '../services/dexcomService/envDexcomConfig.interface';
import { IDbClientEnvConfig } from '../database/client/dbClientEnvConfig.inteface';

export interface IEnvConfig extends IEnvDexcomConfig, IDbClientEnvConfig {}
