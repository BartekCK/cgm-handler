import {
    GetReadingsFailure,
    GetReadingsResult,
    GetReadingsSuccess,
    IDexcomService,
} from '../../../application/services/dexcomService/dexcomService.interface';
import { IDexcomAuth } from './auth/dexcomAuth.interface';
import { IDexcomRoute } from './routing/dexcomRoute.interface';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { IDexcomReading } from '../../../application/services/dexcomService/dexcomReading.interface';
import { dexcomEntitySchema, IDexcomEntity } from './mappers/dexcomEntity.inteface';
import { IDexcomEntityMapper } from './mappers/dexcomEntityMapper.interface';

export class DexcomService implements IDexcomService {
    constructor(
        private readonly dexcomAuth: IDexcomAuth,
        private readonly dexcomRoute: IDexcomRoute,
        private readonly dexcomEntityMapper: IDexcomEntityMapper,
    ) {}

    public async getReadings(data: {
        minutesBefore: number;
        maxCount: number;
    }): Promise<GetReadingsResult> {
        const { minutesBefore, maxCount } = data;

        if (minutesBefore < 1 || minutesBefore > 1440) {
            new GetReadingsFailure({
                errorMessage: 'Minutes must be between 1 and 1440',
                errorCode: 'ARG_ERROR_MINUTES_INVALID',
                errorType: 'DOMAIN_ERROR',
                context: {
                    minutesBefore,
                },
            });
        }

        if (maxCount < 1 || maxCount > 287) {
            new GetReadingsFailure({
                errorMessage: 'Max count must be between 1 and 287',
                errorCode: 'ARG_ERROR_MINUTES_INVALID',
                errorType: 'DOMAIN_ERROR',
                context: {
                    minutesBefore,
                },
            });
        }

        const authStateResult = await this.dexcomAuth.createAuthState();

        if (authStateResult.isFailure()) {
            return authStateResult;
        }

        const { sessionId } = authStateResult.getData().auth;

        let response: AxiosResponse<IDexcomReading[], any>;

        const httpRequestResult = await this.getLatestReadingsHttpRequest({
            sessionId,
            maxCount,
            minutesBefore,
        });

        if (httpRequestResult instanceof GetReadingsFailure) {
            const { errorCode } = httpRequestResult.getError();

            if (errorCode === 'SESSION_ID_NOT_FOUND') {
                console.log('DO IT ONCE AGAIN');
                return;
            } else {
                return httpRequestResult;
            }
        }

        const dexcomEntitySchemaResult = dexcomEntitySchema
            .array()
            .safeParse(httpRequestResult);

        if (!dexcomEntitySchemaResult.success) {
            return new GetReadingsFailure({
                errorMessage: 'Schema not match',
                errorType: 'INFRASTRUCTURE_ERROR',
                errorCode: 'UNKNOWN_SCHEMA_ERROR',
                context: {
                    data: httpRequestResult,
                    schemaError: dexcomEntitySchemaResult.error,
                },
            });
        }

        const dexcomEnitities: IDexcomEntity[] = dexcomEntitySchemaResult.data;

        return new GetReadingsSuccess({
            readings: dexcomEnitities.map((dexcomEnity) =>
                this.dexcomEntityMapper.mapIntoDexcomReading(dexcomEnity),
            ),
        });
    }

    private async getLatestReadingsHttpRequest(data: {
        sessionId: string;
        minutesBefore: number;
        maxCount: number;
    }): Promise<IDexcomEntity[] | GetReadingsFailure> {
        const { sessionId, maxCount, minutesBefore } = data;

        const query = {
            sessionID: sessionId,
            minutes: minutesBefore,
            maxCount,
        };

        try {
            const response = await axios.post<IDexcomEntity[]>(
                this.dexcomRoute.getLatestGlucoseReadingsUrl(),
                {},
                { params: query },
            );

            return response.data;
        } catch (error) {
            if (!(error instanceof AxiosError)) {
                return new GetReadingsFailure({
                    errorMessage: 'Something went wrong during axios post request',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'UNKNOWN_LIBRARY_ERROR',
                    context: {
                        library: 'axios',
                    },
                });
            }

            if (error.response?.data.code === 'SessionIdNotFound') {
                return new GetReadingsFailure({
                    errorMessage: 'Session id is invalid',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'SESSION_ID_NOT_FOUND',
                    context: {
                        data: error.response.data,
                    },
                });
            }

            if (error.response?.data.code === 'InvalidArgument') {
                return new GetReadingsFailure({
                    errorMessage: 'Invalid auth argument',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'INVALID_AUTH_CREDENTIALS',
                    context: {
                        data: error.response.data,
                    },
                });
            }

            return new GetReadingsFailure({
                errorMessage: 'Something went wrong during request',
                errorType: 'INFRASTRUCTURE_ERROR',
                errorCode: 'HTTP_REQUEST_ERROR',
                context: { ...error },
            });
        }
    }
}
