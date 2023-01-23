import { IDexcomAuthState } from './dexcomAuth';
import {
    ERROR_TYPE,
    FailureResult,
    SuccessResult,
} from '../../../../common/types/result';

export class CreateAuthStateSuccess extends SuccessResult<{ auth: IDexcomAuthState }> {}

export type CreateAuthStateErrorCode =
    | 'HTTP_REQUEST_ERROR'
    | 'UNKNOWN_LIBRARY_ERROR'
    | 'INVALID_AUTH_CREDENTIALS';
export class CreateAuthStateFailure extends FailureResult {
    protected readonly errorCode: CreateAuthStateErrorCode;

    constructor(data: {
        errorMessage: string;
        errorCode: CreateAuthStateErrorCode;
        errorType: ERROR_TYPE;
        context?: any;
    }) {
        super(data);
        this.errorCode = data.errorCode;
    }
}

export type CreateAuthStateResult = CreateAuthStateSuccess | CreateAuthStateFailure;

export interface IDexcomAuth {
    createAuthState: () => Promise<CreateAuthStateResult>;
}
