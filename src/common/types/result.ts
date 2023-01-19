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
}

export abstract class FailureResult<T = any> extends Result {
    protected readonly errorMessage: string;
    protected readonly errorCode: string;
    protected readonly errorType: 'DOMAIN_ERROR' | 'INFRASTRUCTURE_ERROR';
    protected readonly context?: T;

    public constructor(
        errorMessage: string,
        errorCode: string,
        errorType: 'DOMAIN_ERROR' | 'INFRASTRUCTURE_ERROR',
        context?: T,
    ) {
        super(false);

        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.errorType = errorType;
        this.context = context;
    }

    public getError(): { errorMessage: string; errorCode: string; errorType: string } {
        return {
            errorMessage: this.errorMessage,
            errorCode: this.errorCode,
            errorType: this.errorType,
        };
    }
}
