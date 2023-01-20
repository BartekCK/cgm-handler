import { ICgmGlucoseDbEntity } from './cgmGlucoseDbEntity.interface';
import {
    CgmGlucose,
    CgmGlucoseId,
    CgmGlucoseTrend,
} from '../../../domain/entities/cgmGlucose/cgmGlucose';
import { ICgmGlucoseDbEntityMapper } from './cgmGlucoseDbEntityMapper.interface';

export class CgmGlucoseDbEntityMapper implements ICgmGlucoseDbEntityMapper {
    public mapIntoCgmGlucoseDbEntity(dbEntity: CgmGlucose): ICgmGlucoseDbEntity {
        const { id, value, valueDate, trend, createdAt } = dbEntity.getState();
        return {
            id,
            value,
            valueDate,
            trend,
            createdAt,
            updatedAt: new Date(),
        };
    }

    public mapIntoCgmGlucoseEntity(dbEntity: ICgmGlucoseDbEntity): CgmGlucose {
        return CgmGlucose.createFromState({
            id: dbEntity.id as CgmGlucoseId,
            value: dbEntity.value,
            valueDate: dbEntity.valueDate,
            trend: dbEntity.trend as CgmGlucoseTrend,
            createdAt: dbEntity.createdAt,
        });
    }
}
