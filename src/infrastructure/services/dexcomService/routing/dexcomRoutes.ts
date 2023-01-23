import { IEnvDexcomConfig } from '../envDexcomConfig.interface';
import { UserLocation } from '../../../../common/types/userLocation';
import { IDexcomRoute } from './dexcomRoute.interface';

export class DexcomRoute implements IDexcomRoute {
    private readonly baseUrl: string;

    constructor(private readonly config: IEnvDexcomConfig) {
        this.baseUrl =
            this.config.getDexcomUserLocation() === UserLocation.US
                ? 'https://share2.dexcom.com/ShareWebServices/Services'
                : 'https://shareous1.dexcom.com/ShareWebServices/Services';
    }

    getAuthUrl(): string {
        return `${this.baseUrl}/General/AuthenticatePublisherAccount`;
    }

    getLatestGlucoseReadingsUrl(): string {
        return `${this.baseUrl}/Publisher/ReadPublisherLatestGlucoseValues`;
    }

    getLoginUrl(): string {
        return `${this.baseUrl}/General/LoginPublisherAccountById`;
    }
}
