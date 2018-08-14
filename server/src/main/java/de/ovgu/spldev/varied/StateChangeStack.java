package de.ovgu.spldev.varied;

import edu.washington.cs.courses.cse143.UndoRedoStack;

public class StateChangeStack {
    private UndoRedoStack<StateChange> stateChangeUndoRedoStack = new UndoRedoStack<>();

    public Message apply(StateChange stateChange) {
        Message stateChangeMessage = stateChange.apply();
        stateChangeUndoRedoStack.push(stateChange);
        return stateChangeMessage;
    }

    public boolean canUndo() {
        return stateChangeUndoRedoStack.canUndo();
    }

    public boolean canRedo() {
        return stateChangeUndoRedoStack.canRedo();
    }

    public Message undo() {
        if (!stateChangeUndoRedoStack.canUndo())
            throw new RuntimeException("can not undo");
        StateChange stateChange = stateChangeUndoRedoStack.peekUndoneValue();
        Message stateChangeMessage = stateChange.undo();
        stateChangeUndoRedoStack.undo();
        return stateChangeMessage;
    }

    public Message redo() {
        if (!stateChangeUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        StateChange stateChange = stateChangeUndoRedoStack.peekRedoneValue();
        Message stateChangeMessage = stateChange.apply();
        stateChangeUndoRedoStack.redo();
        return stateChangeMessage;
    }
}
