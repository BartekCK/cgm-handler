import { ICgmGlucoseDbEntity } from './cgmGlucoseDbEntity.interface';
import { CgmGlucose } from '../../../domain/entities/cgmGlucose/cgmGlucose';

export interface ICgmGlucoseDbEntityMapper {
    mapIntoCgmGlucoseEntity: (dbEntity: ICgmGlucoseDbEntity) => CgmGlucose;
    mapIntoCgmGlucoseDbEntity: (dbEntity: CgmGlucose) => ICgmGlucoseDbEntity;
}
