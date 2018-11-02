package de.ovgu.spldev.varied.common.operations;

public abstract class Operation {
    private boolean applyWasSuccessful = true, undoWasSuccessful = true;

    public final void apply() {
        if (undoWasSuccessful) { // parentheses REQUIRED due to https://github.com/cincheo/jsweet/issues/501
            _apply();
        } else
            throw new RuntimeException("can not redo an invalid operation");
    }

    public final void undo() {
        if (applyWasSuccessful) {
            try {
                _undo();
            } catch (Throwable t) {
                undoWasSuccessful = false;
                throw t;
            }
        } else
            throw new RuntimeException("can not undo an invalid operation");
    }

    // contract: do not throw if apply was successful, throw indicates that undo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this may throw and does not affect feature model integrity.
    protected abstract void _apply();

    // contract: do not throw if undo was successful, throw indicates that redo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this MAY NOT normally throw because undoing a valid operation must always be possible!
    protected abstract void _undo();

    boolean applyWasSuccessful() {
        return applyWasSuccessful;
    }

    boolean undoWasSuccessful() {
        return undoWasSuccessful;
    }
}
