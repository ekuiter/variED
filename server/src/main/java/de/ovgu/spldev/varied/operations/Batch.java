package de.ovgu.spldev.varied.operations;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.StateContext;

import java.util.Iterator;
import java.util.LinkedList;

// adapted from MultiFeatureModelOperation
public class Batch extends BatchOperation {
    private StateContext stateContext;
    private Iterator<Message.IBatchUndoable> messageIterator;
    private boolean atStart = true;
    private Object batchContext;

    public Batch(StateContext stateContext, LinkedList<Message.IBatchUndoable> messages) {
        this.stateContext = stateContext;
        this.messageIterator = messages.iterator();
    }

    boolean _hasNextOperation() {
        return messageIterator.hasNext();
    }

    Operation _nextOperation() {
        Message.IBatchUndoable message = messageIterator.next();
        if (atStart) {
            batchContext = message.createBatchContext();
            atStart = false;
        }
        Operation operation = message.getOperation(stateContext, batchContext);
        batchContext = message.nextBatchContext(operation, batchContext);
        return operation;
    }
}
