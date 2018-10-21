package de.ovgu.spldev.varied.statechanges;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.StateContext;

import java.util.Iterator;
import java.util.LinkedList;

// adapted from MultiFeatureModelOperation
public class Batch extends BatchStateChange {
    private StateContext stateContext;
    private Iterator<Message.IBatchUndoable> messageIterator;
    private boolean atStart = true;
    private Object batchContext;

    public Batch(StateContext stateContext, LinkedList<Message.IBatchUndoable> messages) {
        this.stateContext = stateContext;
        this.messageIterator = messages.iterator();
    }

    boolean _hasNextStateChange() {
        return messageIterator.hasNext();
    }

    StateChange _nextStateChange() {
        Message.IBatchUndoable message = messageIterator.next();
        if (atStart) {
            batchContext = message.createBatchContext();
            atStart = false;
        }
        StateChange stateChange = message.getStateChange(stateContext, batchContext);
        batchContext = message.nextBatchContext(stateChange, batchContext);
        return stateChange;
    }
}
