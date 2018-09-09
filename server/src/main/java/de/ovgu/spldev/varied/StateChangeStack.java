package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.statechanges.StateChange;
import edu.washington.cs.courses.cse143.UndoRedoStack;

public class StateChangeStack {
    private UndoRedoStack<StateChange> stateChangeUndoRedoStack = new UndoRedoStack<>();

    public Message.IEncodable[] apply(StateChange stateChange) {
        Message.IEncodable[] stateChangeMessages = stateChange.apply();
        stateChangeUndoRedoStack.push(stateChange);
        return stateChangeMessages;
    }

    public boolean canUndo() {
        return stateChangeUndoRedoStack.canUndo();
    }

    public boolean canRedo() {
        return stateChangeUndoRedoStack.canRedo();
    }

    public Message.IEncodable[] undo() {
        if (!stateChangeUndoRedoStack.canUndo())
            throw new RuntimeException("can not undo");
        StateChange stateChange = stateChangeUndoRedoStack.peekUndoneValue();
        Message.IEncodable[] stateChangeMessages = stateChange.undo();
        stateChangeUndoRedoStack.undo();
        return stateChangeMessages;
    }

    public Message.IEncodable[] redo() {
        if (!stateChangeUndoRedoStack.canRedo())
            throw new RuntimeException("can not redo");
        StateChange stateChange = stateChangeUndoRedoStack.peekRedoneValue();
        Message.IEncodable[] stateChangeMessages = stateChange.apply();
        stateChangeUndoRedoStack.redo();
        return stateChangeMessages;
    }
}
