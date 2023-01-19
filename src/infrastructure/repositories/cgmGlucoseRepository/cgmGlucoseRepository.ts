import { CgmGlucose } from '../../../domain/entities/cgmGlucose/cgmGlucose';
import {
    GetLatestReadingSuccess,
    GetLatestReadingSuccessResult,
    IGlucoseRepository,
    SaveResult,
    SaveSuccess,
} from '../../../application/repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { IDbClient } from '../../database/client/dbClient.interface';
import { ICgmGlucoseDbEntity } from './cgmGlucoseDbEntity.interface';
import { DatabaseFailure } from '../../../common/types/databaseFailure';
import { ICgmGlucoseDbEntityMapper } from './cgmGlucoseDbEntityMapper.interface';

export const CGM_GLUCOSE_TABLE_NAME = 'cgm_glucose';

export class CgmGlucoseRepository implements IGlucoseRepository {
    constructor(
        private readonly dbClient: IDbClient,
        private readonly cgmGlucoseDbEntityMapper: ICgmGlucoseDbEntityMapper,
    ) {}

    async getLatestReading(): Promise<GetLatestReadingSuccessResult> {
        try {
            const result = await this.dbClient
                .select<ICgmGlucoseDbEntity>()
                .from(CGM_GLUCOSE_TABLE_NAME)
                .orderBy('valueDate')
                .first();

            if (!result) {
                return new GetLatestReadingSuccess(null);
            }

            return new GetLatestReadingSuccess(
                this.cgmGlucoseDbEntityMapper.mapIntoCgmGlucoseEntity(result),
            );
        } catch (error) {
            return new DatabaseFailure('GetLatestReadingSuccessResult', error);
        }
    }

    async save(glucose: CgmGlucose): Promise<SaveResult> {
        try {
            const dbEntity =
                this.cgmGlucoseDbEntityMapper.mapIntoCgmGlucoseDbEntity(glucose);

            await this.dbClient
                .insert<ICgmGlucoseDbEntity>(dbEntity)
                .into(CGM_GLUCOSE_TABLE_NAME)
                .onConflict('id')
                .merge(['value', 'date', 'trend', 'updatedAt']);

            return new SaveSuccess({ id: glucose.getState().id });
        } catch (error) {
            return new DatabaseFailure('SaveResult', error);
        }
    }
}
