import { z } from 'zod';

/**
 Example of data
 {
    WT: 'Date(1674403723000)',
    ST: 'Date(1674403723000)',
    DT: 'Date(1674403723000+0100)',
    Value: 115,
    Trend: 'Flat'
  }
 */

const dateRegex = /^Date\(\d+\)$/;
const dateWithTimezoneRegex = /^Date\(\d+[+-]\d{4}\)$/;

export const dexcomEntitySchema = z.object({
    WT: z.string().regex(dateRegex),
    ST: z.string().regex(dateRegex),
    DT: z.string().regex(dateWithTimezoneRegex),
    Value: z.number().optional(),
    Trend: z.string(),
});

export type IDexcomEntity = z.infer<typeof dexcomEntitySchema>;
