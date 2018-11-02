package edu.washington.cs.courses.cse143;

// see https://courses.cs.washington.edu/courses/cse143/12au/lectures/UndoRedoStack.java
// UndoRedoStack is a variation of the Stack class that supports an undo
// operation for reversing the effect of push and pop operations and a redo
// operation that reverses undo operations.  The canUndo method indicates
// whether an undo is legal.  The canRedo operation indicates whether a redo is
// legal (sequences of undo operations can be redone, but once a push or pop
// operation is performed, it is not possible to redo any undo operations until
// another call is made on undo).

import java.util.Stack;

public class UndoRedoStack<T> extends Stack<T> {
    private Stack undoStack;
    private Stack redoStack;

    // post: constructs an empty UndoRedoStack
    public UndoRedoStack() {
        undoStack = new Stack();
        redoStack = new Stack();
    }

    // post: pushes and returns the given value on top of the stack
    public T push(T value) {
        super.push(value);
        undoStack.push("push");
        redoStack.clear();
        return value;
    }

    // post: pops and returns the value at the top of the stack
    public T pop() {
        T value = super.pop();
        undoStack.push(value);
        undoStack.push("pop");
        redoStack.clear();
        return value;
    }

    // post: returns whether or not an undo can be done
    public boolean canUndo() {
        return !undoStack.isEmpty();
    }

    public T peekUndoneValue() {
        if (!canUndo())
            throw new IllegalStateException();
        Object action = undoStack.pop();
        T value = action.equals("push") ? super.peek() : (T) undoStack.peek();
        undoStack.push(action);
        return value;
    }

    // pre : canUndo() (throws IllegalStateException if not)
    // post: undoes the last stack push or pop command
    public void undo() {
        if (!canUndo()) {
            throw new IllegalStateException();
        }
        Object action = undoStack.pop();
        if (action.equals("push")) {
            T value = super.pop();
            redoStack.push(value);
            redoStack.push("push");
        } else {
            T value = (T) undoStack.pop();
            super.push(value);
            redoStack.push("pop");
        }
    }

    // post: returns whether or not a redo can be done
    public boolean canRedo() {
        return !redoStack.isEmpty();
    }

    public T peekRedoneValue() {
        if (!canRedo())
            throw new IllegalStateException();
        Object action = redoStack.pop();
        T value = action.equals("push") ? (T) redoStack.peek() : super.peek();
        redoStack.push(action);
        return value;
    }

    // pre : canRedo() (throws IllegalStateException if not)
    // post: redoes the last undone operation
    public void redo() {
        if (!canRedo()) {
            throw new IllegalStateException();
        }
        Object action = redoStack.pop();
        if (action.equals("push")) {
            T value = (T) redoStack.pop();
            super.push(value);
            undoStack.push("push");
        } else {
            T value = super.pop();
            undoStack.push(value);
            undoStack.push("pop");
        }
    }
}