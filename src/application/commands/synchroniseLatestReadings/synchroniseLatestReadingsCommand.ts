import { z } from 'zod';
import { commandSchema, ICommand } from '../../../common/command-bus';

export const synchroniseLatestReadingsCommandPayloadSchema = commandSchema.extend({});

export type ISynchroniseLatestReadingsCommand = z.infer<
    typeof synchroniseLatestReadingsCommandPayloadSchema
> &
    ICommand;

export class SynchroniseLatestReadingsCommand
    implements ISynchroniseLatestReadingsCommand
{
    readonly traceId: string;

    constructor({ traceId }: ISynchroniseLatestReadingsCommand) {
        this.traceId = traceId;
    }
}
