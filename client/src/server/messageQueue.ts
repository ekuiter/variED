import {ArtifactPath, Message} from '../types';
import {sendMessage, isSimulateOffline} from './webSocket';
import logger from '../helpers/logger';

const tag = 'queue';
const messageQueue: Message[] = []; // TODO: save in localStorage
let isFlushingMessageQueue = false;

export function enqueueMessage(message: Message, artifactPath?: ArtifactPath): Message {
    if (artifactPath)
        message = {artifactPath, ...message};
    messageQueue.push(message);
    return message;
}

export function numberofUnflushedMessages(): number {
    return messageQueue.length;
}

export async function flushMessageQueue(): Promise<void> {
    if (isSimulateOffline()) {
        logger.warnTagged({tag}, () => 'simulating offline, abort flushing message queue');
        return;
    }

    if (isFlushingMessageQueue) {
        logger.warnTagged({tag}, () => 'already flushing message queue, abort');
        return;
    }

    isFlushingMessageQueue = true;
    const numberOfMessages = messageQueue.length;
    while (messageQueue.length) {
        try {
            await sendMessage(messageQueue[0]);
        } catch (e) {
            // TODO: warn the user that the message will be sent when reconnected (maybe give an undo
            // button to remove the message from the queue and undo the operation)
            logger.warnTagged({tag}, () => `could not send ${messageQueue[0].type} message, abort flushing message queue`);
            isFlushingMessageQueue = false;
            return;
        }
        messageQueue.shift();
    }

    if (numberOfMessages > 0)
        logger.infoTagged({tag}, () => `successfully sent ${numberOfMessages} messages`);
    isFlushingMessageQueue = false;
}