import {ArtifactPath, Message} from '../types';
import {sendMessage, isSimulateOffline, isManualSync} from './webSocket';
import logger from '../helpers/logger';

const tag = 'queue';
const outgoingMessageQueue: Message[] = []; // TODO: save in localStorage
const incomingMessageQueue: Message[] = [];
let isFlushingOutgoingMessageQueue = false;

export function enqueueOutgoingMessage(message: Message, artifactPath?: ArtifactPath): Message {
    if (artifactPath)
        message = {artifactPath, ...message};
    outgoingMessageQueue.push(message);
    return message;
}

function enqueueIncomingMessage(message: Message): void {
    incomingMessageQueue.push(message);
}

export function numberofUnflushedOutgoingMessages(): number {
    return outgoingMessageQueue.length;
}

export async function flushOutgoingMessageQueue(forceFlush = false): Promise<void> {
    if (numberofUnflushedOutgoingMessages() > 0) {
        if (!document.title.startsWith('(*) '))
            document.title = '(*) ' + document.title;
    }
    
    if (isSimulateOffline()) {
        logger.warnTagged({tag}, () => 'simulating offline, abort flushing message queue');
        return;
    }

    if (isFlushingOutgoingMessageQueue) {
        logger.warnTagged({tag}, () => 'already flushing message queue, abort');
        return;
    }

    if (isManualSync() && !forceFlush)
        return;

    isFlushingOutgoingMessageQueue = true;
    const numberOfMessages = outgoingMessageQueue.length;
    while (numberofUnflushedOutgoingMessages() > 0) {
        try {
            await sendMessage(outgoingMessageQueue[0]);
        } catch (e) {
            // TODO: warn the user that the message will be sent when reconnected (maybe give an undo
            // button to remove the message from the queue and undo the operation)
            logger.warnTagged({tag}, () => `could not send ${outgoingMessageQueue[0].type} message, abort flushing message queue`);
            isFlushingOutgoingMessageQueue = false;
            return;
        }
        outgoingMessageQueue.shift();
    }

    if (document.title.startsWith('(*) '))
        document.title = document.title.substr(4);

    if (numberOfMessages > 0)
        logger.infoTagged({tag}, () => `successfully sent ${numberOfMessages} messages`);
    isFlushingOutgoingMessageQueue = false;
}

export function flushIncomingMessageQueue(handleMessage?: (msg: Message) => void, forceFlush = false): void {
    if (isManualSync() && !forceFlush)
        return;

    while (incomingMessageQueue.length > 0) {
        if (handleMessage)
            handleMessage(incomingMessageQueue[0]);
        incomingMessageQueue.shift();
    }
}

export const queueingMessageHandler = (handleMessage?: (msg: Message) => void) =>
    (message: Message): void => {
        enqueueIncomingMessage(message);
        flushIncomingMessageQueue(handleMessage);
    };

export function forceFlushMessageQueues(handleMessage?: (msg: Message) => void): void {
    flushOutgoingMessageQueue(true);
    flushIncomingMessageQueue(handleMessage, true);
}