package de.ovgu.spldev.varied.operations;

import de.ovgu.spldev.varied.messaging.Message;

public abstract class Operation {
    private boolean applyWasSuccessful = true, undoWasSuccessful = true;

    public final Message.IEncodable[] apply() {
        Message.IEncodable[] messages;
        if (undoWasSuccessful)
            try {
                messages = _apply();
            } catch (Throwable t) {
                applyWasSuccessful = false;
                throw t;
            }
        else
            throw new RuntimeException("can not redo an invalid operation");
        return messages;
    }

    public final Message.IEncodable[] undo() {
        Message.IEncodable[] messages;
        if (applyWasSuccessful)
            try {
                messages = _undo();
            } catch (Throwable t) {
                undoWasSuccessful = false;
                throw t;
            }
        else
            throw new RuntimeException("can not undo an invalid operation");
        return messages;
    }

    // contract: do not throw if apply was successful, throw indicates that undo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this may throw and does not affect feature model integrity.

    protected abstract Message.IEncodable[] _apply();
    // contract: do not throw if undo was successful, throw indicates that redo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this MAY NOT normally throw because undoing a valid operation must always be possible!

    protected abstract Message.IEncodable[] _undo();

    boolean isApplyWasSuccessful() {
        return applyWasSuccessful;
    }

    boolean isUndoWasSuccessful() {
        return undoWasSuccessful;
    }
}
