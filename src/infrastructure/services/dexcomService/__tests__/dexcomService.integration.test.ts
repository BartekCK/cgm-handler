import {
    GetReadingsResult,
    GetReadingsSuccess,
    IDexcomService,
} from '../../../../application/services/dexcomService/dexcomService.interface';
import { DexcomService } from '../dexcomService';
import { IDexcomAuth } from '../auth/dexcomAuth.interface';
import { DexcomAuth } from '../auth/dexcomAuth';
import { IDexcomRoute } from '../routing/dexcomRoute.interface';
import { DexcomRoute } from '../routing/dexcomRoutes';
import { IEnvDexcomConfig } from '../envDexcomConfig.interface';
import { EnvConfig } from '../../../envConfig/envConfig';
import { IDexcomEntityMapper } from '../mappers/dexcomEntityMapper.interface';
import { DexcomEntityMapper } from '../mappers/dexcomEntityMapper';
import { faker } from '@faker-js/faker';
import {
    assertResultFailure,
    assertResultSuccess,
} from '../../../../common/__tests__/asserations';
import nock = require('nock');
import { dexcomEntityTestFactory } from './dexcomEntityTestFactory';

describe('DexcomService', () => {
    let dexcomService: IDexcomService;
    let dexcomRoute: IDexcomRoute;

    const minutesBefore = 10;
    const maxCount = 10;
    const sessionId = faker.datatype.uuid();

    beforeAll(async () => {
        const dexcomConfig: IEnvDexcomConfig = await EnvConfig.factory();
        dexcomRoute = new DexcomRoute(dexcomConfig);
        const dexcomAuth: IDexcomAuth = new DexcomAuth(dexcomRoute, dexcomConfig);
        const dexcomEntityMapper: IDexcomEntityMapper = new DexcomEntityMapper();

        nock(dexcomRoute.getAuthUrl()).persist(true).post('').reply(200, {
            accountId: faker.datatype.uuid(),
        });

        nock(dexcomRoute.getLoginUrl()).persist(true).post('').reply(200, {
            sessionId,
        });

        dexcomService = new DexcomService(dexcomAuth, dexcomRoute, dexcomEntityMapper);
    });

    describe('Given incorrect input', () => {
        describe('when minutesBefore are < 1 ', () => {
            it('then should return failure', async () => {
                const result = await dexcomService.getReadings({
                    minutesBefore: 0,
                    maxCount: 100,
                });
                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Minutes must be between 1 and 1440',
                    errorCode: 'ARG_ERROR_MINUTES_INVALID',
                    errorType: 'DOMAIN_ERROR',
                    context: {
                        minutesBefore: 0,
                    },
                });
            });
        });

        describe('when minutesBefore are > 1440 ', () => {
            it('then should return failure', async () => {
                const result = await dexcomService.getReadings({
                    minutesBefore: 1441,
                    maxCount: 100,
                });
                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Minutes must be between 1 and 1440',
                    errorCode: 'ARG_ERROR_MINUTES_INVALID',
                    errorType: 'DOMAIN_ERROR',
                    context: {
                        minutesBefore: 1441,
                    },
                });
            });
        });

        describe('when maxCount is < 1 ', () => {
            it('then should return failure', async () => {
                const result = await dexcomService.getReadings({
                    minutesBefore: 10,
                    maxCount: 0,
                });

                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Max count must be between 1 and 287',
                    errorCode: 'ARG_ERROR_MINUTES_INVALID',
                    errorType: 'DOMAIN_ERROR',
                    context: {
                        maxCount: 0,
                    },
                });
            });
        });

        describe('when maxCount is > 287 ', () => {
            it('then should return failure', async () => {
                const result = await dexcomService.getReadings({
                    minutesBefore: 10,
                    maxCount: 288,
                });

                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Max count must be between 1 and 287',
                    errorCode: 'ARG_ERROR_MINUTES_INVALID',
                    errorType: 'DOMAIN_ERROR',
                    context: {
                        maxCount: 288,
                    },
                });
            });
        });
    });

    describe('Given correct input', () => {
        describe('when http request return unknown error', () => {
            let result: GetReadingsResult;

            beforeAll(async () => {
                nock(dexcomRoute.getLatestGlucoseReadingsUrl())
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(500, {});

                result = await dexcomService.getReadings({ minutesBefore, maxCount });
            });

            it('then should return failure', async () => {
                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Something went wrong during request',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'HTTP_REQUEST_ERROR',
                    context: expect.any(Object),
                });
            });
        });

        describe('when data from http request return unknown schema', () => {
            let result: GetReadingsResult;

            beforeAll(async () => {
                nock(dexcomRoute.getLatestGlucoseReadingsUrl(), {})
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(200, [
                        { ...dexcomEntityTestFactory(), DT: 'INCORRECT_VALUE' },
                    ]);

                result = await dexcomService.getReadings({ minutesBefore, maxCount });
            });

            it('then should return failure', async () => {
                assertResultFailure(result);

                expect(result.getError()).toEqual({
                    errorMessage: 'Schema not match',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'UNKNOWN_SCHEMA_ERROR',
                    context: expect.any(Object),
                });
            });
        });

        describe('when first call finish with expired sessionId but second is ok', () => {
            let result: GetReadingsSuccess;

            const valueDate = faker.date.past();
            const dexcomEntity = dexcomEntityTestFactory({ valueDate });

            beforeAll(async () => {
                nock(dexcomRoute.getLatestGlucoseReadingsUrl(), {})
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(500, { code: 'SessionNotValid' })
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(200, [dexcomEntity]);

                result = (await dexcomService.getReadings({
                    minutesBefore,
                    maxCount,
                })) as GetReadingsSuccess;
            });

            it('then should return success', async () => {
                assertResultSuccess(result);
            });

            it('then should result is mapped into readings', () => {
                expect(result.getData()).toStrictEqual({
                    readings: [
                        {
                            value: dexcomEntity.Value,
                            trend: dexcomEntity.Trend,
                            valueDate,
                        },
                    ],
                });
            });
        });

        describe('when first and "n" call finish with expired sessionId', () => {
            let result: GetReadingsResult;

            beforeAll(async () => {
                nock(dexcomRoute.getLatestGlucoseReadingsUrl(), {})
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(500, { code: 'SessionNotValid' })
                    .post(
                        `?sessionID[sessionId]=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(500, { code: 'SessionNotValid' });

                result = await dexcomService.getReadings({
                    minutesBefore,
                    maxCount,
                });
            });

            it('then should return failure', async () => {
                assertResultFailure(result);

                expect(result.getError()).toStrictEqual({
                    errorMessage: 'Session id is expired',
                    errorCode: 'SESSION_ID_EXPIRED',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    context: { data: { code: 'SessionNotValid' } },
                });
            });
        });
    });
});
