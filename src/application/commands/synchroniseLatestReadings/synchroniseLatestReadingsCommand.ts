import { z } from 'zod';
import { commandSchema, ICommand } from '../../../common/command-bus';

export const synchroniseLatestReadingsCommandPayloadSchema = commandSchema.extend({
    maxCount: z.number().int().optional(),
});

export type ISynchroniseLatestReadingsCommand = z.infer<
    typeof synchroniseLatestReadingsCommandPayloadSchema
> &
    ICommand;

export class SynchroniseLatestReadingsCommand
    implements ISynchroniseLatestReadingsCommand
{
    readonly traceId: string;
    readonly maxCount?: number;

    constructor({ traceId, maxCount }: ISynchroniseLatestReadingsCommand) {
        this.traceId = traceId;
        this.maxCount = maxCount;
    }
}
