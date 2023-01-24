import { IEnvDexcomConfig } from '../envDexcomConfig.interface';
import { IDexcomRoute } from './dexcomRoute.interface';
import { DexcomRoute } from './dexcomRoutes';
import { UserLocation } from '../../../../common/types/userLocation';

describe('DexcomRoute', () => {
    let config: IEnvDexcomConfig;
    let route: IDexcomRoute;

    beforeEach(() => {
        config = {
            getDexcomUserLocation: jest.fn(),
            getDexcomApplicationId: jest.fn(),
            getDexcomPassword: jest.fn(),
            getDexcomUsername: jest.fn(),
        };
    });

    describe('when location is US', () => {
        beforeEach(() => {
            jest.spyOn(config, 'getDexcomUserLocation').mockReturnValue(UserLocation.US);

            route = new DexcomRoute(config);
        });
        describe('getAuthUrl', () => {
            it('should return the correct Auth URL', () => {
                expect(route.getAuthUrl()).toBe(
                    'https://share2.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount',
                );
            });
        });

        describe('getLatestGlucoseReadingsUrl', () => {
            it('should return the correct Latest Glucose Readings URL', () => {
                expect(route.getLatestGlucoseReadingsUrl()).toBe(
                    'https://share2.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues',
                );
            });
        });

        describe('getLoginUrl', () => {
            it('should return the correct Login URL', () => {
                expect(route.getLoginUrl()).toBe(
                    'https://share2.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById',
                );
            });
        });
    });

    describe('when location is EU', () => {
        beforeEach(() => {
            jest.spyOn(config, 'getDexcomUserLocation').mockReturnValue(UserLocation.EU);
            route = new DexcomRoute(config);
        });

        describe('getAuthUrl', () => {
            it('should return the correct Auth URL', () => {
                expect(route.getAuthUrl()).toBe(
                    'https://shareous1.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount',
                );
            });
        });

        describe('getLatestGlucoseReadingsUrl', () => {
            it('should return the correct Latest Glucose Readings URL', () => {
                expect(route.getLatestGlucoseReadingsUrl()).toBe(
                    'https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues',
                );
            });
        });

        describe('getLoginUrl', () => {
            it('should return the correct Login URL', () => {
                expect(route.getLoginUrl()).toBe(
                    'https://shareous1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById',
                );
            });
        });
    });
});
