import { faker } from '@faker-js/faker';
import { ICgmGlucoseDbEntity } from '../cgmGlucoseDbEntity.interface';
import {
    CgmGlucoseId,
    CgmGlucoseTrend,
} from '../../../../domain/entities/cgmGlucose/cgmGlucose';

export const cgmGlucoseDbEntityTestFactory = (
    input?: Partial<ICgmGlucoseDbEntity>,
): ICgmGlucoseDbEntity => ({
    id: faker.datatype.uuid() as CgmGlucoseId,
    value: faker.datatype.number({ min: 50, max: 250 }),
    valueDate: faker.date.past(),
    trend: faker.helpers.arrayElement([
        CgmGlucoseTrend.Flat,
        CgmGlucoseTrend.NotComputable,
        CgmGlucoseTrend.FortyFiveDown,
        CgmGlucoseTrend.DoubleUp,
        CgmGlucoseTrend.SingleUp,
    ]),
    updatedAt: faker.date.past(),
    createdAt: faker.date.past(),
    ...input,
});
