/**
 * Simple mock for a web socket, used in testing.
 */

import {Message, ArtifactPath} from '../../types';

type HandleMessageFunction = (data: Message) => void;

export function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    return Promise.resolve();
}

export const sendMessage = jest.fn((_message: Message, artifactPath?: ArtifactPath): Promise<void> => {
    return Promise.resolve();
});

export const sendBatchMessage = jest.fn((_messages: Message[], artifactPath?: ArtifactPath): Promise<void> => {
    return Promise.resolve();
});