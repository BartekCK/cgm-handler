import { CgmGlucoseDbEntityInteface } from './cgmGlucoseDbEntity.inteface';
import { CgmGlucose } from '../../../domain/entities/cgmGlucose/cgmGlucose';

export interface ICgmGlucoseDbEntityMapper {
    mapIntoCgmGlucoseEntity: (dbEntity: CgmGlucoseDbEntityInteface) => CgmGlucose;
    mapIntoCgmGlucoseDbEntity: (dbEntity: CgmGlucose) => CgmGlucoseDbEntityInteface;
}
