import { Glucose } from '../../../domain/entities/glucose';

export interface IGlucoseRepository {
    getLatestReading: () => Promise<Glucose>;
    save: (glucose: Glucose) => Promise<Glucose>;
}
