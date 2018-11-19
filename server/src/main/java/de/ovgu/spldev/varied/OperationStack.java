package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.common.operations.Operation;
import edu.washington.cs.courses.cse143.UndoRedoStack;
import org.pmw.tinylog.Logger;

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
        Logger.debug("undoing operation {}", operation);
        operation.undo();
        operationUndoRedoStack.undo();
    }

    public void redo() {
        if (!operationUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        Operation operation = operationUndoRedoStack.peekRedoneValue();
        Logger.debug("redoing operation {}", operation);
        operation.apply();
        operationUndoRedoStack.redo();
    }
}
