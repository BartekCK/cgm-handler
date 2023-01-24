import {
    CgmGlucose,
    CgmGlucoseId,
    CgmGlucoseTrend,
    CreateCgmGlucosePayload,
} from '../cgmGlucose';
import { faker } from '@faker-js/faker';

export const cgmGlucoseTestFactory = (
    input?: Partial<CreateCgmGlucosePayload>,
): CgmGlucose => {
    return CgmGlucose.createFromState({
        id: faker.datatype.uuid() as CgmGlucoseId,
        value: faker.datatype.number({ min: 50, max: 240 }),
        valueDate: faker.date.past(),
        trend: CgmGlucoseTrend.Flat,
        createdAt: new Date(),
        ...input,
    });
};
