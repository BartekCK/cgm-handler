import { ICommand } from './command.interface';
import { Result } from '../types/result';

export interface ICommandHandler<
    Command extends ICommand,
    R extends Result | Promise<Result>,
> {
    handle: (command: Command) => R;
}
