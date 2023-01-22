import { IDexcomReading } from '../../../../application/services/dexcomService/dexcomReading.interface';
import { IDexcomEntity } from './dexcomEntity.inteface';

export interface IDexcomEntityMapper {
    mapIntoDexcomReading: (dexcomEntity: IDexcomEntity) => IDexcomReading;
}
