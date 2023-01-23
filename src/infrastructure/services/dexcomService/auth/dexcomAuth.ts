import axios, { AxiosError } from 'axios';
import { IEnvDexcomConfig } from '../envDexcomConfig.interface';
import {
    CreateAuthStateFailure,
    CreateAuthStateResult,
    CreateAuthStateSuccess,
    IDexcomAuth,
} from './dexcomAuth.interface';
import { IDexcomRoute } from '../routing/dexcomRoute.interface';

export interface IDexcomAuthState {
    sessionId: string;
}

export class DexcomAuth implements IDexcomAuth {
    constructor(
        private readonly dexcomRoute: IDexcomRoute,
        private readonly envDexcomConfig: IEnvDexcomConfig,
    ) {}

    public async createAuthState(): Promise<CreateAuthStateResult> {
        const accountIdResult = await this.auth();

        if (accountIdResult instanceof CreateAuthStateFailure) {
            return accountIdResult;
        }

        const accountId: string = accountIdResult;

        const sessionIdResult = await this.login(accountId);

        if (sessionIdResult instanceof CreateAuthStateFailure) {
            return sessionIdResult;
        }

        const sessionId: string = sessionIdResult;

        return new CreateAuthStateSuccess({ auth: { sessionId } });
    }

    private async auth(): Promise<string | CreateAuthStateFailure> {
        try {
            const response = await axios.post(this.dexcomRoute.getAuthUrl(), {
                accountName: this.envDexcomConfig.getDexcomUsername(),
                password: this.envDexcomConfig.getDexcomPassword(),
                applicationId: this.envDexcomConfig.getDexcomApplicationId(),
            });

            const accountId = response.data;

            return accountId;
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async login(accountId: string): Promise<string | CreateAuthStateFailure> {
        try {
            const response = await axios.post(this.dexcomRoute.getLoginUrl(), {
                password: this.envDexcomConfig.getDexcomPassword(),
                applicationId: this.envDexcomConfig.getDexcomApplicationId(),
                accountId,
            });

            const sessionId = response.data;

            return sessionId;
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleError(errorInstance: Error | unknown): CreateAuthStateFailure {
        if (!(errorInstance instanceof AxiosError)) {
            return new CreateAuthStateFailure({
                errorMessage: 'Something went wrong during axios post request',
                errorType: 'INFRASTRUCTURE_ERROR',
                errorCode: 'UNKNOWN_LIBRARY_ERROR',
                context: {
                    library: 'axios',
                    method: 'auth',
                    class: DexcomAuth.name,
                },
            });
        }

        if (errorInstance.response?.data.code === 'AccountPasswordInvalid') {
            return new CreateAuthStateFailure({
                errorMessage: 'Invalid dexcom credentials',
                errorType: 'INFRASTRUCTURE_ERROR',
                errorCode: 'INVALID_AUTH_CREDENTIALS',
                context: {
                    data: errorInstance.response.data,
                },
            });
        }

        if (errorInstance.response?.data.code === 'InvalidArgument') {
            return new CreateAuthStateFailure({
                errorMessage: 'Invalid auth argument',
                errorType: 'INFRASTRUCTURE_ERROR',
                errorCode: 'INVALID_AUTH_CREDENTIALS',
                context: {
                    data: errorInstance.response.data,
                },
            });
        }

        return new CreateAuthStateFailure({
            errorMessage: 'Something went wrong during request',
            errorType: 'INFRASTRUCTURE_ERROR',
            errorCode: 'HTTP_REQUEST_ERROR',
            context: { ...errorInstance },
        });
    }
}
