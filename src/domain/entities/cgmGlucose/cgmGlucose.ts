import { v4 } from 'uuid';

// export type CgmGlucoseProps = z.infer<typeof configPropsSchema>;

export type CgmGlucoseId = string & { name: 'CgmGlucoseId' };

export enum CgmGlucoseTrend {
    None = 'None',
    DoubleUp = 'DoubleUp',
    SingleUp = 'SingleUp',
    FortyFiveUp = 'FortyFiveUp',
    Flat = 'Flat',
    FortyFiveDown = 'FortyFiveDown',
    SingleDown = 'SingleDown',
    DoubleDown = 'DoubleDown',
    NotComputable = 'NotComputable',
    RateOutOfRange = 'RateOutOfRange',
}

export interface CgmGlucoseState {
    id: CgmGlucoseId;
    value: number | null;
    valueDate: Date;
    trend: CgmGlucoseTrend;
    createdAt: Date;
}

export interface CreateCgmGlucosePayload {
    value: number | null;
    valueDate: Date;
    trend: CgmGlucoseTrend;
}

export class CgmGlucose {
    private constructor(private readonly state: CgmGlucoseState) {}

    public static createFromState(state: CgmGlucoseState): CgmGlucose {
        return new CgmGlucose(state);
    }

    public static create({
        valueDate,
        trend,
        value,
    }: CreateCgmGlucosePayload): CgmGlucose {
        if (
            !value &&
            ![CgmGlucoseTrend.RateOutOfRange, CgmGlucoseTrend.None].includes(trend)
        ) {
            throw new Error('Should be value here');
        }

        return new CgmGlucose({
            valueDate: valueDate,
            trend,
            value,
            id: v4() as CgmGlucoseId,
            createdAt: new Date(),
        });
    }

    public getState(): CgmGlucoseState {
        return this.state;
    }
}
