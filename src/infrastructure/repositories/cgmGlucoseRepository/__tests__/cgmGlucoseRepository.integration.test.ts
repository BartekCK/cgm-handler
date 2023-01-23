import {
    GetLatestReadingSuccessResult,
    ICgmGlucoseRepository,
    SaveManyResult,
    SaveResult,
} from '../../../../application/repositories/cgmGlucoseRepository/cgmGlucoseRepository.interface';
import { CGM_GLUCOSE_TABLE_NAME, CgmGlucoseRepository } from '../cgmGlucoseRepository';
import { IDbClient } from '../../../database/client/dbClient.interface';
import { CgmGlucoseDbEntityMapper } from '../cgmGlucoseDbEntityMapper';
import { DbClientFactory } from '../../../database/client/dbClientFactory';
import { EnvConfig } from '../../../envConfig/envConfig';
import { cgmGlucoseTestFactory } from '../../../../domain/entities/cgmGlucose/__tests__/cgmGlucoseTestFactory';
import { assertResultSuccess } from '../../../../common/__tests__/asserations';
import { CgmGlucoseTrend } from '../../../../domain/entities/cgmGlucose/cgmGlucose';
import { cgmGlucoseDbEntityTestFactory } from './cgmGlucoseDbEntityTestFactory';

describe('cgmGlucoseRepository', () => {
    let cgmGlucoseRepository: ICgmGlucoseRepository;
    let dbClient: IDbClient;
    const cgmGlucoseDbEntityMapper = new CgmGlucoseDbEntityMapper();

    beforeAll(async () => {
        const envDatabaseConfig = await EnvConfig.factory();

        const dbClientFactory = new DbClientFactory(envDatabaseConfig);
        dbClient = dbClientFactory.createDbClient();

        cgmGlucoseRepository = new CgmGlucoseRepository(
            dbClient,
            cgmGlucoseDbEntityMapper,
        );
    });

    afterAll(async () => {
        await dbClient(CGM_GLUCOSE_TABLE_NAME).truncate();
        await dbClient.destroy();
    });

    describe('cgmGlucoseRepository.save()', () => {
        describe('when save first time', () => {
            const cgmGlucose = cgmGlucoseTestFactory();
            let result: SaveResult;

            beforeAll(async () => {
                result = await cgmGlucoseRepository.save(cgmGlucose);
            });

            it('then should CgmGlucose should be persisted', async () => {
                const dbEntity = await dbClient
                    .select()
                    .from(CGM_GLUCOSE_TABLE_NAME)
                    .where({ id: cgmGlucose.getState().id })
                    .first();

                expect(dbEntity).toStrictEqual({
                    id: cgmGlucose.getState().id,
                    value: cgmGlucose.getState().value,
                    valueDate: cgmGlucose.getState().valueDate,
                    trend: cgmGlucose.getState().trend,
                    createdAt: cgmGlucose.getState().createdAt,
                    updatedAt: expect.any(Date),
                });
            });

            it('then result should be success with id', async () => {
                assertResultSuccess(result);

                expect(result.getData()).toEqual({ id: cgmGlucose.getState().id });
            });
        });

        describe('when save n time', () => {
            let result: SaveResult;

            const cgmGlucoseDbEntity = cgmGlucoseDbEntityTestFactory({
                trend: CgmGlucoseTrend.Flat,
            });

            const updatedTrend = CgmGlucoseTrend.FortyFiveUp;

            const cgmGlucose = cgmGlucoseTestFactory({
                ...cgmGlucoseDbEntity,
                trend: updatedTrend,
            });

            beforeAll(async () => {
                await dbClient.insert(cgmGlucoseDbEntity).into(CGM_GLUCOSE_TABLE_NAME);

                result = await cgmGlucoseRepository.save(cgmGlucose);
            });

            it('then should CgmGlucose should be persisted', async () => {
                const dbEntity = await dbClient
                    .select()
                    .from(CGM_GLUCOSE_TABLE_NAME)
                    .where({ id: cgmGlucose.getState().id })
                    .first();

                expect(dbEntity).toStrictEqual({
                    id: cgmGlucose.getState().id,
                    value: cgmGlucose.getState().value,
                    valueDate: cgmGlucose.getState().valueDate,
                    trend: updatedTrend,
                    createdAt: cgmGlucose.getState().createdAt,
                    updatedAt: expect.any(Date),
                });
            });

            it('then result should be success with id', async () => {
                assertResultSuccess(result);

                expect(result.getData()).toEqual({ id: cgmGlucose.getState().id });
            });
        });
    });

    describe('cgmGlucoseRepository.getLatestReading()', () => {
        const latestCgmGlucoseDbEntity = cgmGlucoseDbEntityTestFactory({
            valueDate: new Date(),
        });
        const pastCgmGlucoseDbEntity = cgmGlucoseDbEntityTestFactory({
            valueDate: new Date(Date.now() - 50000),
        });

        beforeAll(async () => {
            await dbClient(CGM_GLUCOSE_TABLE_NAME).truncate();
            await dbClient
                .insert([pastCgmGlucoseDbEntity, latestCgmGlucoseDbEntity])
                .into(CGM_GLUCOSE_TABLE_NAME);
        });

        describe('when database contain many records', () => {
            let result: GetLatestReadingSuccessResult;

            beforeAll(async () => {
                result = await cgmGlucoseRepository.getLatestReading();
            });

            it('then result should contain latest entity', async () => {
                assertResultSuccess(result);

                expect(latestCgmGlucoseDbEntity).toStrictEqual({
                    ...result.getData().cgmGlucose?.getState(),
                    updatedAt: expect.any(Date),
                });
            });
        });
    });

    describe('cgmGlucoseRepository.saveMany()', () => {
        describe('when save first time', () => {
            const cgmGlucoses = [
                cgmGlucoseTestFactory(),
                cgmGlucoseTestFactory(),
                cgmGlucoseTestFactory(),
                cgmGlucoseTestFactory(),
                cgmGlucoseTestFactory(),
            ];

            let result: SaveManyResult;

            beforeAll(async () => {
                result = await cgmGlucoseRepository.saveMany(cgmGlucoses);
            });

            it('then all CgmGlucoses should be persisted', async () => {
                const dbEntities = await dbClient
                    .select()
                    .from(CGM_GLUCOSE_TABLE_NAME)
                    .whereIn(
                        'id',
                        cgmGlucoses.map((g) => g.getState().id),
                    );

                expect(dbEntities).toHaveLength(cgmGlucoses.length);
            });

            it('then result should be success with ids', async () => {
                assertResultSuccess(result);

                expect(result.getData()).toEqual({
                    ids: cgmGlucoses.map((g) => g.getState().id),
                });
            });
        });
    });
});
