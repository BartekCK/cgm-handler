import { IDbClient } from '../../../../infrastructure/database/client/dbClient.interface';
import {
    CommandBus,
    ICommand,
    ICommandBus,
    ICommandHandler,
} from '../../../../common/command-bus';
import { ICgmGlucoseRepository } from '../../../repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import {
    CGM_GLUCOSE_TABLE_NAME,
    CgmGlucoseRepository,
} from '../../../../infrastructure/repositories/cgmGlucoseRepository/cgmGlucoseRepository';
import { EnvConfig } from '../../../../infrastructure/envConfig/envConfig';
import { DbClientFactory } from '../../../../infrastructure/database/client/dbClientFactory';
import { CgmGlucoseDbEntityMapper } from '../../../../infrastructure/repositories/cgmGlucoseRepository/cgmGlucoseDbEntityMapper';
import {
    SynchroniseLatestReadingsCommandHandler,
    SynchroniseLatestReadingsCommandHandlerResult,
    SynchroniseLatestReadingsCommandHandlerSuccess,
} from '../synchroniseLatestReadingsCommandHandler';
import { DexcomRoute } from '../../../../infrastructure/services/dexcomService/routing/dexcomRoutes';
import { IDexcomAuth } from '../../../../infrastructure/services/dexcomService/auth/dexcomAuth.interface';
import { DexcomEntityMapper } from '../../../../infrastructure/services/dexcomService/mappers/dexcomEntityMapper';
import { DexcomService } from '../../../../infrastructure/services/dexcomService/dexcomService';
import { IDexcomRoute } from '../../../../infrastructure/services/dexcomService/routing/dexcomRoute.interface';
import { IDexcomService } from '../../../services/dexcomService/dexcomService.interface';
import { FailureResult, Result } from '../../../../common/types/result';
import { SynchroniseLatestReadingsCommand } from '../synchroniseLatestReadingsCommand';
import { v4 } from 'uuid';
import {
    assertResultFailure,
    assertResultSuccess,
} from '../../../../common/__tests__/asserations';
import { InvalidPayloadFailure } from '../../../../common/types/invalidPayloadFailure';
import nock = require('nock');
import { dexcomEntityTestFactory } from '../../../../infrastructure/services/dexcomService/__tests__/dexcomEntityTestFactory';

describe('SynchroniseLatestReadingsCommandHandler', () => {
    let commandBus: ICommandBus;
    let dbClient: IDbClient;
    let cgmGlucoseRepository: ICgmGlucoseRepository;
    let dexcomRoute: IDexcomRoute;

    const sessionId = v4();
    const minutesBefore = 1440;
    const maxCount = 10;

    const dexcomAuth = {
        createAuthState: jest.fn(() => ({
            isFailure: () => false,
            getData: () => ({
                auth: {
                    sessionId,
                },
            }),
        })),
    };

    beforeAll(async () => {
        const envConfig = await EnvConfig.factory();

        const dbClientFactory = new DbClientFactory(envConfig);

        dbClient = dbClientFactory.createDbClient();

        cgmGlucoseRepository = new CgmGlucoseRepository(
            dbClient,
            new CgmGlucoseDbEntityMapper(),
        );

        dexcomRoute = new DexcomRoute(envConfig);

        const dexcomService: IDexcomService = new DexcomService(
            dexcomAuth as unknown as IDexcomAuth,
            dexcomRoute,
            new DexcomEntityMapper(),
        );

        const synchroniseLatestReadingsCommandHandler =
            new SynchroniseLatestReadingsCommandHandler({
                cgmGlucoseRepository,
                dexcomService,
            });

        const commandMap: Map<
            string,
            ICommandHandler<ICommand, Promise<Result>>
        > = new Map();
        commandMap.set(
            SynchroniseLatestReadingsCommand.name,
            synchroniseLatestReadingsCommandHandler,
        );

        commandBus = new CommandBus(commandMap);
    });

    afterAll(async () => {
        await dbClient(CGM_GLUCOSE_TABLE_NAME).truncate();
        await dbClient.destroy();
    });

    describe('Given correct `SynchroniseLatestReadingsCommand`', () => {
        const command = new SynchroniseLatestReadingsCommand({
            traceId: v4(),
        });

        describe('when sync was made first time', () => {
            const dexcomEntities = [
                dexcomEntityTestFactory(),
                dexcomEntityTestFactory(),
                dexcomEntityTestFactory(),
            ];

            let result: SynchroniseLatestReadingsCommandHandlerSuccess;

            beforeAll(async () => {
                await dbClient(CGM_GLUCOSE_TABLE_NAME).truncate();

                nock(dexcomRoute.getLatestGlucoseReadingsUrl(), {})
                    .post(
                        `?sessionID=${sessionId}&minutes=${minutesBefore}&maxCount=${maxCount}`,
                        {},
                    )
                    .reply(200, dexcomEntities);

                const handlerResult = await commandBus.execute<
                    SynchroniseLatestReadingsCommand,
                    Promise<SynchroniseLatestReadingsCommandHandlerResult>
                >(command);

                assertResultSuccess(handlerResult);

                result = handlerResult;
            });

            it('then all objects should be persisted', async () => {
                const dbRecords = await dbClient
                    .select()
                    .from(CGM_GLUCOSE_TABLE_NAME)
                    .whereIn('id', result.getData().ids);

                expect(dbRecords).toHaveLength(dexcomEntities.length);
            });
        });
    });

    describe('Given incorrect `SynchroniseLatestReadingsCommand`', () => {
        const command = new SynchroniseLatestReadingsCommand({
            traceId: v4(),
            maxCount: 15.12,
        });

        describe('when command is executed', () => {
            let result: FailureResult;

            beforeAll(async () => {
                const handlerResult = await commandBus.execute<
                    SynchroniseLatestReadingsCommand,
                    Promise<SynchroniseLatestReadingsCommandHandlerResult>
                >(command);

                assertResultFailure(handlerResult);

                result = handlerResult;
            });

            it('then failure should be InvalidPayloadFailure', () => {
                expect(result).toBeInstanceOf(InvalidPayloadFailure);

                expect(result.getError()).toEqual({
                    errorMessage: 'Invalid data inside SynchroniseLatestReadingsCommand',
                    errorCode: 'INVALID_PAYLOAD',
                    errorType: 'DOMAIN_ERROR',
                    context: expect.any(Object),
                });
            });
        });
    });
});
