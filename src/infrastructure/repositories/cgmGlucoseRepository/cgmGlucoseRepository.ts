import { CgmGlucose } from '../../../domain/entities/cgmGlucose/cgmGlucose';
import {
    GetLatestReadingSuccess,
    GetLatestReadingSuccessResult,
    ICgmGlucoseRepository,
    SaveManyResult,
    SaveManySuccess,
    SaveResult,
    SaveSuccess,
} from '../../../application/repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { IDbClient } from '../../database/client/dbClient.interface';
import { ICgmGlucoseDbEntity } from './cgmGlucoseDbEntity.interface';
import { DatabaseFailure } from '../../../common/types/databaseFailure';
import { ICgmGlucoseDbEntityMapper } from './cgmGlucoseDbEntityMapper.interface';

export const CGM_GLUCOSE_TABLE_NAME = 'cgm_glucose';

export class CgmGlucoseRepository implements ICgmGlucoseRepository {
    constructor(
        private readonly dbClient: IDbClient,
        private readonly cgmGlucoseDbEntityMapper: ICgmGlucoseDbEntityMapper,
    ) {}

    async getLatestReading(): Promise<GetLatestReadingSuccessResult> {
        try {
            const result = await this.dbClient
                .select<ICgmGlucoseDbEntity>()
                .from(CGM_GLUCOSE_TABLE_NAME)
                .orderBy('valueDate', 'desc')
                .first();

            if (!result) {
                return new GetLatestReadingSuccess({ cgmGlucose: null });
            }

            return new GetLatestReadingSuccess({
                cgmGlucose: this.cgmGlucoseDbEntityMapper.mapIntoCgmGlucoseEntity(result),
            });
        } catch (error) {
            return new DatabaseFailure({
                errorMessage: 'Error occurred during getting latest CgmGlucose item',
                context: { error },
            });
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
                .merge(['value', 'valueDate', 'trend', 'updatedAt']);

            return new SaveSuccess({ id: glucose.getState().id });
        } catch (error) {
            return new DatabaseFailure({
                errorMessage: 'Error occurred during save CgmGlucose',
                context: { error },
            });
        }
    }

    async saveMany(glucoses: CgmGlucose[]): Promise<SaveManyResult> {
        if (!glucoses.length) {
            return new SaveManySuccess({
                ids: [],
            });
        }

        try {
            const dbEntities = glucoses.map((glucose) =>
                this.cgmGlucoseDbEntityMapper.mapIntoCgmGlucoseDbEntity(glucose),
            );

            await this.dbClient
                .insert<ICgmGlucoseDbEntity>(dbEntities)
                .into(CGM_GLUCOSE_TABLE_NAME);

            return new SaveManySuccess({
                ids: glucoses.map((glucose) => glucose.getState().id),
            });
        } catch (error) {
            return new DatabaseFailure({
                errorMessage: 'Error occurred during save many CgmGlucose',
                context: { error },
            });
        }
    }
}
