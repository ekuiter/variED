package de.ovgu.spldev.varied.statechanges;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.StateContext;

import java.util.Iterator;
import java.util.LinkedList;

// adapted from MultiFeatureModelOperation
public class MultipleMessages extends MultipleStateChange {
    private StateContext stateContext;
    private Iterator<Message.IMultipleUndoable> messageIterator;
    private boolean atStart = true;
    private Object multipleContext;

    public MultipleMessages(StateContext stateContext, LinkedList<Message.IMultipleUndoable> messages) {
        this.stateContext = stateContext;
        this.messageIterator = messages.iterator();
    }

    boolean _hasNextStateChange() {
        return messageIterator.hasNext();
    }

    StateChange _nextStateChange() {
        Message.IMultipleUndoable message = messageIterator.next();
        if (atStart) {
            multipleContext = message.createMultipleContext();
            atStart = false;
        }
        StateChange stateChange = message.getStateChange(stateContext, multipleContext);
        multipleContext = message.nextMultipleContext(stateChange, multipleContext);
        return stateChange;
    }
}
