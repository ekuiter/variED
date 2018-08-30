import defer from './defer';

jest.useFakeTimers();

describe('defer', () => {
    it('defers execution of a function to the end of the event queue', () => {
        const fn = jest.fn();
        defer(fn)(42);
        expect(fn).not.toBeCalled();
        jest.runTimersToTime(0); // TODO: now advanceTimersByTime, wait for create-react-app update
        expect(fn).toBeCalledWith(42);
    });
});