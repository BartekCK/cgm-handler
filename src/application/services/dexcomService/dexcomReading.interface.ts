import { CgmGlucoseTrend } from '../../../domain/entities/cgmGlucose/cgmGlucose';
import { z } from 'zod';

export const dexcomReadingSchema = z.object({
    value: z.number().nullable(),
    valueDate: z.date(),
    trend: z.nativeEnum(CgmGlucoseTrend),
});

export type IDexcomReading = z.infer<typeof dexcomReadingSchema>;
