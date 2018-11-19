package de.ovgu.spldev.varied.common.operations;

public abstract class Operation {
    private boolean applyWasSuccessful = true, undoWasSuccessful = true;

    public final void apply() throws InvalidOperationException {
        if (undoWasSuccessful) { // parentheses REQUIRED due to https://github.com/cincheo/jsweet/issues/501
            _apply();
        } else
            throw new InvalidOperationException("can not redo an invalid operation");
    }

    public final void undo() throws InvalidOperationException {
        if (applyWasSuccessful) {
            try {
                _undo();
            } catch (Throwable t) {
                undoWasSuccessful = false;
                throw t;
            }
        } else
            throw new InvalidOperationException("can not undo an invalid operation");
    }

    // contract: do not throw if apply was successful, throw indicates that undo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this may throw and does not affect feature model integrity.
    protected abstract void _apply() throws InvalidOperationException;

    // contract: do not throw if undo was successful, throw indicates that redo is invalid
    // throw also indicates that _the feature model was not changed_ (should be atomic).
    // this MAY NOT normally throw because undoing a valid operation must always be possible!
    protected abstract void _undo() throws InvalidOperationException;

    boolean applyWasSuccessful() {
        return applyWasSuccessful;
    }

    boolean undoWasSuccessful() {
        return undoWasSuccessful;
    }

    /**
     * Exception class thrown whenever preconditions of an operation are violated.
     * These are usually concerning semantics of the feature model, such as "the root feature may not be deleted".
     * Simple violations in terms of wrong parameters (null etc.) throw an IllegalArgumentException instead.
     * We can use this exception to track problems created by concurrent editing of a feature model.
     */
    public static class InvalidOperationException extends Exception {
        public InvalidOperationException(String message) {
            super(message);
        }

        public InvalidOperationException(Throwable cause) {
            super(cause);
        }
    }
}
