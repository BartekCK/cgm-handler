import { cgmGlucoseTestFactory } from '../../../../domain/entities/cgmGlucose/__tests__/cgmGlucoseTestFactory';
import { ICgmGlucoseDbEntityMapper } from '../cgmGlucoseDbEntityMapper.interface';
import { CgmGlucoseDbEntityMapper } from '../cgmGlucoseDbEntityMapper';
import { cgmGlucoseDbEntityTestFactory } from './cgmGlucoseDbEntityTestFactory';
import { CgmGlucose } from '../../../../domain/entities/cgmGlucose/cgmGlucose';

describe('cgmGlucoseDbEntityMapper', () => {
    const mapper: ICgmGlucoseDbEntityMapper = new CgmGlucoseDbEntityMapper();

    describe('Given CgmGlucose', () => {
        const cgmGlucose = cgmGlucoseTestFactory();

        it('then should map into CgmGlucoseDbEntity', () => {
            const cgmGlucoseDbEntity = mapper.mapIntoCgmGlucoseDbEntity(cgmGlucose);

            expect(cgmGlucoseDbEntity).toEqual({
                id: cgmGlucose.getState().id,
                value: cgmGlucose.getState().value,
                valueDate: cgmGlucose.getState().valueDate,
                trend: cgmGlucose.getState().trend,
                updatedAt: expect.any(Date),
                createdAt: cgmGlucose.getState().createdAt,
            });
        });
    });

    describe('Given CgmGlucoseDbEntity', () => {
        const cgmGlucoseDbEntity = cgmGlucoseDbEntityTestFactory();

        it('then should map into CgmGlucose', () => {
            const cgmGlucose = mapper.mapIntoCgmGlucoseEntity(cgmGlucoseDbEntity);

            expect(cgmGlucose.getState()).toEqual({
                id: cgmGlucoseDbEntity.id,
                value: cgmGlucoseDbEntity.value,
                valueDate: cgmGlucoseDbEntity.valueDate,
                trend: cgmGlucoseDbEntity.trend,
                createdAt: cgmGlucoseDbEntity.createdAt,
            });

            expect(cgmGlucose).toBeInstanceOf(CgmGlucose);
        });
    });
});
