import { FailureResult, SuccessResult } from '../../../common/types/result';
import { IDexcomReading } from './dexcomReading.interface';

export class GetReadingsSuccess extends SuccessResult<{ readings: IDexcomReading[] }> {}
export class GetReadingsFailure extends FailureResult {}

export type GetReadingsResult = GetReadingsSuccess | GetReadingsFailure;

export interface IDexcomService {
    getReadings: (data: {
        minutesBefore: number;
        maxCount: number;
    }) => Promise<GetReadingsResult>;
}
