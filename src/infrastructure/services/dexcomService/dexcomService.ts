import {
    GetReadingsFailure,
    GetReadingsResult,
    GetReadingsSuccess,
    IDexcomService,
} from '../../../application/services/dexcomService/dexcomService.interface';
import { IDexcomAuth } from './auth/dexcomAuth.interface';
import { IDexcomRoute } from './routing/dexcomRoute.interface';
import axios, { AxiosError } from 'axios';
import { dexcomEntitySchema, IDexcomEntity } from './dexcomEntity.inteface';
import { IDexcomEntityMapper } from './mappers/dexcomEntityMapper.interface';

export class DexcomService implements IDexcomService {
    private readonly MAX_LOOP_ITERATION = 2;

    constructor(
        private readonly dexcomAuth: IDexcomAuth,
        private readonly dexcomRoute: IDexcomRoute,
        private readonly dexcomEntityMapper: IDexcomEntityMapper,
        private sessionId: string | null = null,
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

        let i = 0;
        let shouldBeRepeated = false;
        let httpRequestResult: IDexcomEntity[] | GetReadingsFailure;

        do {
            shouldBeRepeated = false;

            if (!this.sessionId) {
                const authStateResult = await this.dexcomAuth.createAuthState();

                if (authStateResult.isFailure()) {
                    return authStateResult;
                }

                this.sessionId = authStateResult.getData().auth.sessionId;
            }

            httpRequestResult = await this.getLatestReadingsHttpRequest({
                sessionId: this.sessionId,
                maxCount,
                minutesBefore,
            });

            if (
                httpRequestResult instanceof GetReadingsFailure &&
                httpRequestResult.getError().errorCode === 'SESSION_ID_EXPIRED'
            ) {
                shouldBeRepeated = true;
                this.sessionId = null;
            }

            i++;
        } while (i < this.MAX_LOOP_ITERATION && shouldBeRepeated);

        if (httpRequestResult instanceof GetReadingsFailure) {
            return httpRequestResult;
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

        const dexcomEntities: IDexcomEntity[] = dexcomEntitySchemaResult.data;

        return new GetReadingsSuccess({
            readings: dexcomEntities.map((dexcomEnity) =>
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

            if (error.response?.data.code === 'SessionNotValid') {
                return new GetReadingsFailure({
                    errorMessage: 'Session id is expired',
                    errorType: 'INFRASTRUCTURE_ERROR',
                    errorCode: 'SESSION_ID_EXPIRED',
                    context: {
                        data: error.response.data,
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
