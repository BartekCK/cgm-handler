export abstract class Result {
    protected readonly success: boolean;

    protected constructor(success: boolean) {
        this.success = success;
    }

    public isSuccess(): boolean {
        return this.success;
    }

    public isFailure(): boolean {
        return !this.success;
    }
}

export abstract class SuccessResult<T> extends Result {
    private readonly data: T;

    public constructor(data: T) {
        super(true);
        this.data = data;
    }

    public getData(): T {
        return this.data;
    }

    public isSuccess(): this is SuccessResult<T> {
        return this.success === true;
    }
}

export type ERROR_TYPE = 'DOMAIN_ERROR' | 'INFRASTRUCTURE_ERROR';

export abstract class FailureResult<T = any> extends Result {
    protected readonly errorMessage: string;
    protected readonly errorCode: string;
    protected readonly errorType: ERROR_TYPE;
    protected readonly context?: T;

    public constructor(data: {
        errorMessage: string;
        errorCode: string;
        errorType: 'DOMAIN_ERROR' | 'INFRASTRUCTURE_ERROR';
        context?: T;
    }) {
        const { errorCode, errorType, errorMessage, context } = data;
        super(false);

        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.errorType = errorType;
        this.context = context;
    }

    public getError(): {
        errorMessage: string;
        errorCode: string;
        errorType: string;
        context?: T;
    } {
        return {
            errorMessage: this.errorMessage,
            errorCode: this.errorCode,
            errorType: this.errorType,
            context: this.context,
        };
    }

    public isFailure(): this is FailureResult {
        return this.success === false;
    }
}
