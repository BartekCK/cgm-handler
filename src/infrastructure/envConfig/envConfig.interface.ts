import { IEnvDexcomConfig } from '../../application/config/envConfig/envDexcomConfig.interface';
import { IDbClientEnvConfig } from '../database/client/dbClientEnvConfig.inteface';

export interface IEnvConfig extends IEnvDexcomConfig, IDbClientEnvConfig {}
