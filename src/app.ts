import { EnvConfig } from './infrastructure/envConfig/envConfig';
import { DbClientFactory } from './infrastructure/database/client/dbClientFactory';
import { CgmGlucoseRepository } from './infrastructure/repositories/cgmGlucoseRepository/cgmGlucoseRepository';
import { CgmGlucoseDbEntityMapper } from './infrastructure/repositories/cgmGlucoseRepository/cgmGlucoseDbEntityMapper';
import { DexcomRoute } from './infrastructure/services/dexcomService/routing/dexcomRoutes';
import { IDexcomService } from './application/services/dexcomService/dexcomService.interface';
import { DexcomService } from './infrastructure/services/dexcomService/dexcomService';
import { IDexcomAuth } from './infrastructure/services/dexcomService/auth/dexcomAuth.interface';
import { DexcomEntityMapper } from './infrastructure/services/dexcomService/mappers/dexcomEntityMapper';
import {
    SynchroniseLatestReadingsCommandHandler,
    SynchroniseLatestReadingsCommandHandlerResult,
} from './application/commands/synchroniseLatestReadings/synchroniseLatestReadingsCommandHandler';
import { CommandBus, ICommand, ICommandBus, ICommandHandler } from './common/command-bus';
import { Result } from './common/types/result';
import { SynchroniseLatestReadingsCommand } from './application/commands/synchroniseLatestReadings/synchroniseLatestReadingsCommand';
import { IDexcomRoute } from './infrastructure/services/dexcomService/routing/dexcomRoute.interface';
import { ICgmGlucoseRepository } from './application/repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { IDbClient } from './infrastructure/database/client/dbClient.interface';
import { IEnvConfig } from './infrastructure/envConfig/envConfig.interface';
import { DexcomAuth } from './infrastructure/services/dexcomService/auth/dexcomAuth';
import { v4 } from 'uuid';

export const lambdaHandler = async (event: Record<string, unknown>) => {
    console.log(event);

    const envConfig: IEnvConfig = await EnvConfig.factory();
    const dbClientFactory = new DbClientFactory(envConfig);
    const dbClient: IDbClient = dbClientFactory.createDbClient();
    const cgmGlucoseRepository: ICgmGlucoseRepository = new CgmGlucoseRepository(
        dbClient,
        new CgmGlucoseDbEntityMapper(),
    );
    const dexcomRoute: IDexcomRoute = new DexcomRoute(envConfig);
    const dexcomAuth: IDexcomAuth = new DexcomAuth(dexcomRoute, envConfig);
    const dexcomService: IDexcomService = new DexcomService(
        dexcomAuth,
        dexcomRoute,
        new DexcomEntityMapper(),
    );
    const synchroniseLatestReadingsCommandHandler =
        new SynchroniseLatestReadingsCommandHandler({
            cgmGlucoseRepository,
            dexcomService,
        });
    const commandMap: Map<string, ICommandHandler<ICommand, Promise<Result>>> = new Map();
    commandMap.set(
        SynchroniseLatestReadingsCommand.name,
        synchroniseLatestReadingsCommandHandler,
    );
    const commandBus: ICommandBus = new CommandBus(commandMap);

    const command = new SynchroniseLatestReadingsCommand({
        traceId: v4(),
        maxCount: event?.maxCount ? Number(event?.maxCount) : undefined,
    });

    const handlerResult = await commandBus.execute<
        SynchroniseLatestReadingsCommand,
        Promise<SynchroniseLatestReadingsCommandHandlerResult>
    >(command);

    if (handlerResult.isFailure()) {
        return handlerResult.getError();
    }

    return handlerResult.getData();
};
