package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.common.operations.Operation;
import edu.washington.cs.courses.cse143.UndoRedoStack;

public class OperationStack {
    private UndoRedoStack<Operation> operationUndoRedoStack = new UndoRedoStack<>();

    public void apply(Operation operation) {
        operation.apply();
        operationUndoRedoStack.push(operation);
    }

    public boolean canUndo() {
        return operationUndoRedoStack.canUndo();
    }

    public boolean canRedo() {
        return operationUndoRedoStack.canRedo();
    }

    public void undo() {
        if (!operationUndoRedoStack.canUndo())
            throw new RuntimeException("can not undo");
        Operation operation = operationUndoRedoStack.peekUndoneValue();
        operation.undo();
        operationUndoRedoStack.undo();
    }

    public void redo() {
        if (!operationUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        Operation operation = operationUndoRedoStack.peekRedoneValue();
        operation.apply();
        operationUndoRedoStack.redo();
    }
}
