import { CgmGlucose, CgmGlucoseId } from '../../../domain/entities/cgmGlucose/cgmGlucose';
import { SuccessResult } from '../../../common/types/result';
import { DatabaseFailure } from '../../../common/types/databaseFailure';

export class SaveSuccess extends SuccessResult<{ id: CgmGlucoseId }> {}
export type SaveResult = SaveSuccess | DatabaseFailure;

export class GetLatestReadingSuccess extends SuccessResult<{
    cgmGlucose: CgmGlucose | null;
}> {}
export type GetLatestReadingSuccessResult = GetLatestReadingSuccess | DatabaseFailure;

export class SaveManySuccess extends SuccessResult<{ ids: CgmGlucoseId[] }> {}
export type SaveManyResult = SaveManySuccess | DatabaseFailure;

export interface ICgmGlucoseRepository {
    getLatestReading: () => Promise<GetLatestReadingSuccessResult>;
    save: (glucose: CgmGlucose) => Promise<SaveResult>;
    saveMany: (glucoses: CgmGlucose[]) => Promise<SaveManyResult>;
}
