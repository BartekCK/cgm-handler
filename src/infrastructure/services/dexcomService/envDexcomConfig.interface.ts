import { UserLocation } from '../../../common/types/userLocation';

export interface IEnvDexcomConfig {
    getDexcomUsername: () => string;
    getDexcomPassword: () => string;
    getDexcomApplicationId: () => string;
    getDexcomUserLocation: () => UserLocation;
}
