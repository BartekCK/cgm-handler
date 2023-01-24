import { FailureResult, SuccessResult } from '../types/result';

export function assertResultSuccess<T = any>(
    result: FailureResult | SuccessResult<T>,
): asserts result is SuccessResult<T> {
    if (result.isFailure()) {
        const { errorMessage, errorCode, errorType } = result.getError();

        throw new Error(`${errorType}\n${errorCode}: ${errorMessage}`);
    }
}

export function assertResultFailure(
    result: FailureResult | SuccessResult<any>,
): asserts result is FailureResult<any> {
    if (result.isSuccess()) {
        throw new Error('Result should be failure');
    }
}
