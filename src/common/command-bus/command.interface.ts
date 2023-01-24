import { z } from 'zod';

export const commandSchema = z.object({
    traceId: z.string(),
});

export type ICommand = z.infer<typeof commandSchema>;
