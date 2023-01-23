import { IDexcomEntityMapper } from '../dexcomEntityMapper.interface';
import { DexcomEntityMapper } from '../dexcomEntityMapper';
import { dexcomEntityTestFactory } from '../../__tests__/dexcomEntityTestFactory';
import { faker } from '@faker-js/faker';

describe('DexcomEntityMapper', () => {
    let dexcomEntityMapper: IDexcomEntityMapper;

    beforeEach(() => {
        dexcomEntityMapper = new DexcomEntityMapper();
    });

    describe('mapIntoDexcomReading', () => {
        it('should correctly map the input into a DexcomReading object', () => {
            const valueDate = faker.date.past();

            const dexcomEntity = dexcomEntityTestFactory({ valueDate });

            const result = dexcomEntityMapper.mapIntoDexcomReading(dexcomEntity);

            expect(result).toEqual({
                value: dexcomEntity.Value,
                trend: dexcomEntity.Trend,
                valueDate,
            });
        });
    });
});
