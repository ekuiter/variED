import {ArtifactPath, Message} from '../types';
import {sendMessage} from './webSocket';
import logger from '../helpers/logger';
import {State} from '../store/types';

const tag = 'queue';
const messageQueue: Message[] = []; // TODO: save in localStorage

function isSimulateOffline() {
    const state: State | undefined =
        (window as any).app && (window as any).app.store && (window as any).app.store.getState();
    if (!state)
        logger.warn(() => 'store not accessible, can not simulate offline site');
    return state ? state.settings.developer.simulateOffline : 0;
}

export function enqueueMessage(message: Message, artifactPath?: ArtifactPath): Message {
    if (artifactPath)
        message = {artifactPath, ...message};
    messageQueue.push(message);
    return message;
}

export async function flushMessageQueue(): Promise<void> {
    if (isSimulateOffline()) {
        logger.warnTagged({tag}, () => `simulating offline, abort flushing message queue`);
        return;
    }

    const numberOfMessages = messageQueue.length;
    while (messageQueue.length) {
        try {
            await sendMessage(messageQueue[0]);
        } catch (e) {
            // TODO: warn the user that the message will be sent when reconnected (maybe give an undo
            // button to remove the message from the queue and undo the operation)
            logger.warnTagged({tag}, () => `could not send ${messageQueue[0].type} message, abort flushing message queue`);
            return;
        }
        messageQueue.shift();
    }

    if (numberOfMessages > 0)
        logger.infoTagged({tag}, () => `successfully sent ${numberOfMessages} messages`);
}