import {
    ISynchroniseLatestReadingsCommand,
    synchroniseLatestReadingsCommandPayloadSchema,
} from './synchroniseLatestReadingsCommand';
import { SuccessResult } from '../../../common/types/result';
import {
    CgmGlucose,
    CgmGlucoseId,
    CreateCgmGlucoseFailure,
    CreateCgmGlucoseResult,
} from '../../../domain/entities/cgmGlucose/cgmGlucose';
import { ICgmGlucoseRepository } from '../../repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { ICommand, ICommandHandler } from '../../../common/command-bus';
import { InvalidPayloadFailure } from '../../../common/types/invalidPayloadFailure';
import {
    GetReadingsFailure,
    IDexcomService,
} from '../../services/dexcomService/dexcomService.interface';
import { DatabaseFailure } from '../../../common/types/databaseFailure';
import { dexcomReadingSchema } from '../../services/dexcomService/dexcomReading.interface';

export class SynchroniseLatestReadingsCommandHandlerSuccess extends SuccessResult<{
    ids: CgmGlucoseId[];
}> {}

export type SynchroniseLatestReadingsCommandHandlerResult =
    | SynchroniseLatestReadingsCommandHandlerSuccess
    | CreateCgmGlucoseFailure
    | InvalidPayloadFailure
    | DatabaseFailure
    | GetReadingsFailure;

type Dependencies = {
    cgmGlucoseRepository: ICgmGlucoseRepository;
    dexcomService: IDexcomService;
};

export class SynchroniseLatestReadingsCommandHandler
    implements
        ICommandHandler<
            ISynchroniseLatestReadingsCommand,
            Promise<SynchroniseLatestReadingsCommandHandlerResult>
        >
{
    private readonly cgmGlucoseRepository: ICgmGlucoseRepository;
    private readonly dexcomService: IDexcomService;

    constructor(dependencies: Dependencies) {
        this.cgmGlucoseRepository = dependencies.cgmGlucoseRepository;
        this.dexcomService = dependencies.dexcomService;
    }

    async handle(
        command: ICommand,
    ): Promise<SynchroniseLatestReadingsCommandHandlerResult> {
        const validationResult =
            synchroniseLatestReadingsCommandPayloadSchema.safeParse(command);

        if (!validationResult.success) {
            return new InvalidPayloadFailure({
                errorMessage: 'Invalid data inside SynchroniseLatestReadingsCommand',
                context: { ...validationResult.error },
            });
        }

        const { maxCount } = validationResult.data;

        const [dexcomReadingsResult, latestCgmGlucoseResult] = await Promise.all([
            this.dexcomService.getReadings({
                minutesBefore: 1440,
                maxCount: maxCount || 10,
            }),
            this.cgmGlucoseRepository.getLatestReading(),
        ]);

        console.log(dexcomReadingsResult);
        console.log(latestCgmGlucoseResult);

        if (dexcomReadingsResult.isFailure()) {
            return dexcomReadingsResult;
        }

        if (latestCgmGlucoseResult.isFailure()) {
            return latestCgmGlucoseResult;
        }

        console.log('AFTER queries 2');

        const { readings: dexcomReadings } = dexcomReadingsResult.getData();

        const dexcomReadingsValidationResult = dexcomReadingSchema
            .array()
            .safeParse(dexcomReadings);

        if (!dexcomReadingsValidationResult.success) {
            return new InvalidPayloadFailure({
                errorMessage: 'Invalid data inside DexcomReadings',
                context: { ...dexcomReadingsValidationResult.error },
            });
        }

        const { cgmGlucose: latestCgmGlucose } = latestCgmGlucoseResult.getData();

        let createdCgmGlucoseResults: CreateCgmGlucoseResult[];

        if (!latestCgmGlucose) {
            createdCgmGlucoseResults = dexcomReadings.map((dexcomReading) =>
                CgmGlucose.create(dexcomReading),
            );
        } else {
            const latestDexcomReadings = dexcomReadings.filter(
                (dexcomReading) =>
                    dexcomReading.valueDate > latestCgmGlucose.getState().valueDate,
            );

            createdCgmGlucoseResults = latestDexcomReadings.map((dexcomReading) =>
                CgmGlucose.create(dexcomReading),
            );
        }

        const createdCgmGlucoses: CgmGlucose[] = [];

        createdCgmGlucoseResults.forEach((createdCgmGlucoseResult) => {
            if (createdCgmGlucoseResult.isSuccess()) {
                const { cgmGlucose } = createdCgmGlucoseResult.getData();
                createdCgmGlucoses.push(cgmGlucose);

                return;
            }
            // TODO: Log information about not created
        });

        const saveManyResult = await this.cgmGlucoseRepository.saveMany(
            createdCgmGlucoses.sort(
                (a, b) =>
                    b.getState().valueDate.getTime() - a.getState().valueDate.getTime(),
            ),
        );

        if (saveManyResult.isFailure()) {
            return saveManyResult;
        }

        const { ids } = saveManyResult.getData();

        return new SynchroniseLatestReadingsCommandHandlerSuccess({
            ids,
        });
    }
}
