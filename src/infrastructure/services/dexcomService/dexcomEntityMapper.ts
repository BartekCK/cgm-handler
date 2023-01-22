import { IDexcomEntityMapper } from './mappers/dexcomEntityMapper.interface';
import { IDexcomEntity } from './mappers/dexcomEntity.inteface';
import { IDexcomReading } from '../../../application/services/dexcomService/dexcomReading.interface';
import { CgmGlucoseTrend } from '../../../domain/entities/cgmGlucose/cgmGlucose';

export class DexcomEntityMapper implements IDexcomEntityMapper {
    mapIntoDexcomReading(dexcomEntity: IDexcomEntity): IDexcomReading {
        const input = dexcomEntity.DT;

        const timestamp = (input.match(/\d+/) as RegExpMatchArray)[0];
        const date = new Date(parseInt(timestamp));

        return {
            value: dexcomEntity.Value,
            trend: dexcomEntity.Trend as CgmGlucoseTrend,
            valueDate: date,
        };
    }
}
