import {Message} from '../../types';

type HandleMessageFunction = (data: Message) => void;

export function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    return Promise.resolve();
}

export const sendMessage = jest.fn((_message: Message): Promise<void> => {
    return Promise.resolve();
});