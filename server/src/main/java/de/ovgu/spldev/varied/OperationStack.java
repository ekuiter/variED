package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.operations.Operation;
import edu.washington.cs.courses.cse143.UndoRedoStack;

public class OperationStack {
    private UndoRedoStack<Operation> operationUndoRedoStack = new UndoRedoStack<>();

    public Message.IEncodable[] apply(Operation operation) {
        Message.IEncodable[] operationMessages = operation.apply();
        operationUndoRedoStack.push(operation);
        return operationMessages;
    }

    public boolean canUndo() {
        return operationUndoRedoStack.canUndo();
    }

    public boolean canRedo() {
        return operationUndoRedoStack.canRedo();
    }

    public Message.IEncodable[] undo() {
        if (!operationUndoRedoStack.canUndo())
            throw new RuntimeException("can not undo");
        Operation operation = operationUndoRedoStack.peekUndoneValue();
        Message.IEncodable[] operationMessages = operation.undo();
        operationUndoRedoStack.undo();
        return operationMessages;
    }

    public Message.IEncodable[] redo() {
        if (!operationUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        Operation operation = operationUndoRedoStack.peekRedoneValue();
        Message.IEncodable[] operationMessages = operation.apply();
        operationUndoRedoStack.redo();
        return operationMessages;
    }
}
