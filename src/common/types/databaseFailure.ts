import { FailureResult } from './result';

export class DatabaseFailure extends FailureResult {
    public constructor(errorMessage?: string, context?: unknown) {
        super(errorMessage || '', 'DATABASE_FAILURE', 'INFRASTRUCTURE_ERROR', context);
    }
}
