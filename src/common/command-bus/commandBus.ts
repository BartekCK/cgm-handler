import { ICommandBus } from './commandBus.interface';
import { ICommandHandler } from './commandHandler.interface';
import { ICommand } from './command.interface';
import { Result } from '../types/result';

export class CommandBus implements ICommandBus {
    private commandHandlers: Map<
        string,
        ICommandHandler<ICommand, Result | Promise<Result>>
    >;

    constructor(
        commandHandlers: Map<string, ICommandHandler<ICommand, Result | Promise<Result>>>,
    ) {
        this.commandHandlers = commandHandlers;
    }

    public execute<Command extends ICommand, R extends Result | Promise<Result>>(
        command: Command,
    ): R {
        const handler = this.findCommandHandler(command);

        if (!handler) {
            throw new Error(
                `Command for handler doesn't exist, commandName: ${command.constructor.name}`,
                {
                    cause: {
                        commandName: command.constructor.name,
                    },
                },
            );
        }

        return <R>handler.handle(command);
    }

    private findCommandHandler(
        command: ICommand,
    ): ICommandHandler<ICommand, Result | Promise<Result>> | null {
        const className = command.constructor.name;

        const handler = this.commandHandlers.get(className);

        return handler || null;
    }
}
