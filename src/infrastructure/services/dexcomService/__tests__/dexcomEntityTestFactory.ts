import { IDexcomEntity } from '../dexcomEntity.inteface';
import { faker } from '@faker-js/faker';

type DexcomEntityTestFactoryInput = Omit<Partial<IDexcomEntity>, 'ST' | 'DT' | 'WT'> & {
    valueDate?: Date;
};

export const dexcomEntityTestFactory = (
    input?: DexcomEntityTestFactoryInput,
): IDexcomEntity => {
    const randomDate = input?.valueDate || faker.date.past();

    return {
        WT: `Date(${randomDate.getTime()})`,
        ST: `Date(${randomDate.getTime()})`,
        DT: `Date(${randomDate.getTime()}+0100)`,
        Value:
            input?.Value === undefined
                ? faker.datatype.number({ min: 50, max: 300 })
                : input.Value,
        Trend: input?.Trend || 'Flat',
    };
};
