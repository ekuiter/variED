package de.ovgu.spldev.varied;

import edu.washington.cs.courses.cse143.UndoRedoStack;

public class StateChangeStack {
    private UndoRedoStack<StateChange> stateChangeUndoRedoStack = new UndoRedoStack<>();

    public Message.IEncodable apply(StateChange stateChange) {
        Message.IEncodable stateChangeMessage = stateChange.apply();
        stateChangeUndoRedoStack.push(stateChange);
        return stateChangeMessage;
    }

    public boolean canUndo() {
        return stateChangeUndoRedoStack.canUndo();
    }

    public boolean canRedo() {
        return stateChangeUndoRedoStack.canRedo();
    }

    public Message.IEncodable undo() {
        if (!stateChangeUndoRedoStack.canUndo())
            throw new RuntimeException("can not undo");
        StateChange stateChange = stateChangeUndoRedoStack.peekUndoneValue();
        Message.IEncodable stateChangeMessage = stateChange.undo();
        stateChangeUndoRedoStack.undo();
        return stateChangeMessage;
    }

    public Message.IEncodable redo() {
        if (!stateChangeUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        StateChange stateChange = stateChangeUndoRedoStack.peekRedoneValue();
        Message.IEncodable stateChangeMessage = stateChange.apply();
        stateChangeUndoRedoStack.redo();
        return stateChangeMessage;
    }
}
