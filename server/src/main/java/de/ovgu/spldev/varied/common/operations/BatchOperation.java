package de.ovgu.spldev.varied.common.operations;

import de.ovgu.spldev.varied.common.util.BridgeUtils;

import java.util.Iterator;
import java.util.LinkedList;

public abstract class BatchOperation extends Operation {
    private LinkedList<Operation> operations = new LinkedList<>();
    private Iterator<Operation> operationIterator;

    public void addOperation(Operation operation) {
        operations.add(operation);
    }

    private boolean hasNextOperation() {
        if (operationIterator == null)
            return _hasNextOperation();
        else
            return operationIterator.hasNext();
    }

    private Operation nextOperation() {
        if (operationIterator == null) {
            Operation operation = _nextOperation();
            operations.add(operation);
            return operation;
        } else
            return operationIterator.next();
    }

    // can be overridden to provide custom iterator-based operation instantiation
    private boolean _hasNextOperation() {
        if (operationIterator == null)
            operationIterator = operations.iterator();
        return operationIterator.hasNext();
    }

    private Operation _nextOperation() {
        if (operationIterator == null)
            operationIterator = operations.iterator();
        return operationIterator.next();
    }

    // if applying one operation fails, undo all applied operations to guarantee atomicity
    protected void _apply() throws InvalidOperationException {
        while (hasNextOperation()) {
            Operation operation = null;
            Throwable t = null;
            try {
                operation = nextOperation();
                operation.apply();
            } catch (Throwable _t) {
                t = _t;
            }
            if (operation == null || !operation.applyWasSuccessful()) {
                boolean found = operation == null; // if building the operations, undo all operations
                for (final Iterator<Operation> it = BridgeUtils.descendingIterator(operations); it.hasNext(); ) {
                    Operation _operation = it.next();
                    if (found)
                        try {
                            _operation.undo();
                        } catch (Throwable _t) {
                            throw new InvalidOperationException("error while undoing an invalid operation");
                        }
                    if (_operation == operation)
                        found = true;
                }
                if (t == null)
                    throw new InvalidOperationException("unknown error while applying operation");
                else
                    throw new InvalidOperationException(t);
            }
        }
        operationIterator = operations.iterator();
    }

    // if undoing one operation fails, redo all undone operations to guarantee atomicity
    protected void _undo() throws InvalidOperationException {
        for (final Iterator<Operation> it = BridgeUtils.descendingIterator(operations); it.hasNext(); ) {
            Operation operation = it.next();
            Throwable t = null;
            try {
                operation.undo();
            } catch (Throwable _t) {
                t = _t;
            }
            if (!operation.undoWasSuccessful()) {
                boolean found = false;
                for (Operation _operation : operations) {
                    if (found)
                        try {
                            _operation.apply();
                        } catch (Throwable _t) {
                            throw new InvalidOperationException("error while redoing an invalid operation");
                        }
                    if (_operation == operation)
                        found = true;
                }
                if (t == null)
                    throw new InvalidOperationException("unknown error while undoing operation");
                else
                    throw new InvalidOperationException(t);
            }
        }
    }
}
