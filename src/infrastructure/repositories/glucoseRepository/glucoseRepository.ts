import { Glucose } from '../../../domain/entities/glucose';
import { IGlucoseRepository } from '../../../application/repositories/glucoseRepository/glucoseRepository.interface';
import { IDbClient } from '../../database/client/dbClient';

export class GlucoseRepository implements IGlucoseRepository {
    constructor(private readonly dbClient: IDbClient) {}

    getLatestReading(): Promise<Glucose> {
        throw new Error('Not implemented yet');
    }

    save(glucose: Glucose): Promise<Glucose> {
        throw new Error('Not implemented yet');
    }
}
