import {
    ISynchroniseLatestReadingsCommand,
    synchroniseLatestReadingsCommandPayloadSchema,
} from './synchroniseLatestReadingsCommand';
import { SuccessResult } from '../../../common/types/result';
import {
    CgmGlucose,
    CgmGlucoseId,
    CgmGlucoseTrend,
} from '../../../domain/entities/cgmGlucose/cgmGlucose';
import { DatabaseFailure } from '../../../common/types/databaseFailure';
import { ICgmGlucoseRepository } from '../../repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { ICommand, ICommandHandler } from '../../../common/command-bus';

export class SynchroniseLatestReadingsCommandHandlerSuccess extends SuccessResult<{
    id: CgmGlucoseId;
}> {}
export type SynchroniseLatestReadingsCommandHandlerFailure = DatabaseFailure;

export type SynchroniseLatestReadingsCommandHandlerResult =
    | SynchroniseLatestReadingsCommandHandlerSuccess
    | SynchroniseLatestReadingsCommandHandlerFailure;

type Dependencies = {
    cgmGlucoseRepository: ICgmGlucoseRepository;
};

export class SynchroniseLatestReadingsCommandHandler
    implements
        ICommandHandler<
            ISynchroniseLatestReadingsCommand,
            Promise<SynchroniseLatestReadingsCommandHandlerResult>
        >
{
    private readonly cgmGlucoseRepository: ICgmGlucoseRepository;

    constructor(dependencies: Dependencies) {
        this.cgmGlucoseRepository = dependencies.cgmGlucoseRepository;
    }

    async handle(
        command: ICommand,
    ): Promise<SynchroniseLatestReadingsCommandHandlerResult> {
        const validationResult =
            synchroniseLatestReadingsCommandPayloadSchema.safeParse(command);

        if (!validationResult.success) {
            throw new Error('Not implemented yet');
            // return InvalidPayloadFailure.create(valiasddationResult.error);
        }

        const cgmGlucose = CgmGlucose.create({
            trend: CgmGlucoseTrend.SingleUp,
            value: 123,
            valueDate: new Date(),
        });

        const saveResult = await this.cgmGlucoseRepository.save(cgmGlucose);

        if (saveResult.isFailure()) {
            return saveResult;
        }

        return new SynchroniseLatestReadingsCommandHandlerSuccess({
            id: cgmGlucose.getState().id,
        });
    }
}
