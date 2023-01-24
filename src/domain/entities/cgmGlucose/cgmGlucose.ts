import { v4 } from 'uuid';

import { InvalidPayloadFailure } from '../../../common/types/invalidPayloadFailure';
import { FailureResult, SuccessResult } from '../../../common/types/result';
import { z } from 'zod';

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

const createCgmGlucosePayloadSchema = z.object({
    value: z.number().nullable(),
    valueDate: z.date(),
    trend: z.nativeEnum(CgmGlucoseTrend),
});
export type CreateCgmGlucosePayload = z.infer<typeof createCgmGlucosePayloadSchema>;

export class CreateCgmGlucoseSuccess extends SuccessResult<{
    cgmGlucose: CgmGlucose;
}> {}
export class CreateCgmGlucoseFailure extends FailureResult {}
export type CreateCgmGlucoseResult =
    | CreateCgmGlucoseSuccess
    | CreateCgmGlucoseFailure
    | InvalidPayloadFailure;

export class CgmGlucose {
    private constructor(private readonly state: CgmGlucoseState) {}

    public static createFromState(state: CgmGlucoseState): CgmGlucose {
        return new CgmGlucose(state);
    }

    public static create(payload: CreateCgmGlucosePayload): CreateCgmGlucoseResult {
        const payloadResult = createCgmGlucosePayloadSchema.safeParse(payload);

        if (!payloadResult.success) {
            return new InvalidPayloadFailure({
                errorMessage: 'Invalid payload during creating CgmGlucose',
                context: { ...payloadResult.error },
            });
        }

        const { value, valueDate, trend } = payloadResult.data;

        const allowedTrendsWhenNullValue = [
            CgmGlucoseTrend.RateOutOfRange,
            CgmGlucoseTrend.None,
        ];

        if (!value && !allowedTrendsWhenNullValue.includes(trend)) {
            return new CreateCgmGlucoseFailure({
                errorMessage: 'Value should not be null during CgmGlucose creation',
                errorType: 'DOMAIN_ERROR',
                errorCode: 'INCORRECT_VALUE_IN_CGM_GLUCOSE',
                context: { value, trend, allowedTrendsWhenNullValue },
            });
        }

        return new CreateCgmGlucoseSuccess({
            cgmGlucose: new CgmGlucose({
                valueDate: valueDate,
                trend,
                value,
                id: v4() as CgmGlucoseId,
                createdAt: new Date(),
            }),
        });
    }

    public getState(): CgmGlucoseState {
        return this.state;
    }
}
