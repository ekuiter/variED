package de.ovgu.spldev.varied.statechanges;

import de.ovgu.spldev.varied.messaging.Message;

import java.util.Iterator;
import java.util.LinkedList;

public abstract class MultipleStateChange extends StateChange {
    private LinkedList<StateChange> stateChanges = new LinkedList<>();
    private Iterator<StateChange> stateChangeIterator;

    public void addStateChange(StateChange stateChange) {
        stateChanges.add(stateChange);
    }

    private boolean hasNextStateChange() {
        if (stateChangeIterator == null)
            return _hasNextStateChange();
        else
            return stateChangeIterator.hasNext();
    }

    private StateChange nextStateChange() {
        if (stateChangeIterator == null) {
            StateChange stateChange = _nextStateChange();
            stateChanges.add(stateChange);
            return stateChange;
        } else
            return stateChangeIterator.next();
    }

    // can be overridden to provide custom iterator-based state change instantiation
    boolean _hasNextStateChange() {
        if (stateChangeIterator == null)
            stateChangeIterator = stateChanges.iterator();
        return stateChangeIterator.hasNext();
    }

    StateChange _nextStateChange() {
        if (stateChangeIterator == null)
            stateChangeIterator = stateChanges.iterator();
        return stateChangeIterator.next();
    }

    // if applying one state change fails, undo all applied state changes to guarantee atomicity
    protected Message.IEncodable[] _apply() {
        Message.IEncodable[] stateChangeMessages = new Message.IEncodable[0];
        while (hasNextStateChange()) {
            StateChange stateChange = null;
            Throwable t = null;
            try {
                stateChange = nextStateChange();
                stateChangeMessages = stateChange.apply();
            } catch (Throwable _t) {
                t = _t;
            }
            if (stateChange == null || !stateChange.isApplyWasSuccessful()) {
                boolean found = stateChange == null; // if building the state changes, undo all state changes
                for (final Iterator<StateChange> it = stateChanges.descendingIterator(); it.hasNext(); ) {
                    StateChange _stateChange = it.next();
                    if (found)
                        try {
                            _stateChange.undo();
                        } catch (Throwable _t) {
                            throw new RuntimeException("error while undoing an invalid state change");
                        }
                    if (_stateChange == stateChange)
                        found = true;
                }
                if (t == null)
                    throw new RuntimeException("unknown error while applying state change");
                else
                    throw new RuntimeException(t);
            }
        }
        stateChangeIterator = stateChanges.iterator();
        return stateChangeMessages;
    }

    // if undoing one state change fails, redo all undone state changes to guarantee atomicity
    protected Message.IEncodable[] _undo() {
        Message.IEncodable[] stateChangeMessages = new Message.IEncodable[0];
        for (final Iterator<StateChange> it = stateChanges.descendingIterator(); it.hasNext(); ) {
            StateChange stateChange = it.next();
            Throwable t = null;
            try {
                stateChangeMessages = stateChange.undo();
            } catch (Throwable _t) {
                t = _t;
            }
            if (!stateChange.isUndoWasSuccessful()) {
                boolean found = false;
                for (StateChange _stateChange : stateChanges) {
                    if (found)
                        try {
                            _stateChange.apply();
                        } catch (Throwable _t) {
                            throw new RuntimeException("error while redoing an invalid state change");
                        }
                    if (_stateChange == stateChange)
                        found = true;
                }
                if (t == null)
                    throw new RuntimeException("unknown error while undoing state change");
                else
                    throw new RuntimeException(t);
            }
        }
        return stateChangeMessages;
    }
}
