import {
    CgmGlucose,
    CgmGlucoseTrend,
    CreateCgmGlucoseFailure,
    CreateCgmGlucosePayload,
} from '../cgmGlucose';
import { InvalidPayloadFailure } from '../../../../common/types/invalidPayloadFailure';
import {
    assertResultFailure,
    assertResultSuccess,
} from '../../../../common/__tests__/asserations';

describe('CgmGlucose', () => {
    describe('CgmGlucose.create', () => {
        it('should return failure when payload is invalid', () => {
            const invalidPayload: CreateCgmGlucosePayload = {
                value: 100,
                trend: 'INVALID_TREND' as CgmGlucoseTrend,
                valueDate: new Date(),
            };

            const result = CgmGlucose.create(invalidPayload);

            expect(result).toBeInstanceOf(InvalidPayloadFailure);
        });

        it('should return failure when vale is null and trend is not allowed', () => {
            const payload: CreateCgmGlucosePayload = {
                value: null,
                trend: CgmGlucoseTrend.SingleUp,
                valueDate: new Date(),
            };

            const result = CgmGlucose.create(payload);

            assertResultFailure(result);
            expect(result).toBeInstanceOf(CreateCgmGlucoseFailure);
            expect(result.getError()).toEqual({
                errorMessage: 'Value should not be null during CgmGlucose creation',
                errorType: 'DOMAIN_ERROR',
                errorCode: 'INCORRECT_VALUE_IN_CGM_GLUCOSE',
                context: {
                    value: payload.value,
                    trend: payload.trend,
                    allowedTrendsWhenNullValue: [
                        CgmGlucoseTrend.RateOutOfRange,
                        CgmGlucoseTrend.None,
                    ],
                },
            });
        });

        it('should create new CgmGlucose', () => {
            const payload: CreateCgmGlucosePayload = {
                value: null,
                trend: CgmGlucoseTrend.RateOutOfRange,
                valueDate: new Date(),
            };

            const result = CgmGlucose.create(payload);

            assertResultSuccess(result);

            expect(result.getData().cgmGlucose).toBeInstanceOf(CgmGlucose);
            expect(result.getData().cgmGlucose.getState()).toEqual({
                id: expect.any(String),
                value: payload.value,
                valueDate: payload.valueDate,
                trend: payload.trend,
                createdAt: expect.any(Date),
            });
        });
    });
});
