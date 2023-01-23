import { ICommand } from './command.interface';
import { Result } from '../types/result';

export interface ICommandBus {
    execute: <Command extends ICommand, R extends Result | Promise<Result>>(
        command: Command,
    ) => R;
}
