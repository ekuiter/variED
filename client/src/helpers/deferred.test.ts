import deferred from './deferred';

jest.useFakeTimers();

describe('deferred', () => {
    it('defers execution of a function to the end of the event queue', () => {
        const fn = jest.fn();
        deferred(fn)(42);
        expect(fn).not.toBeCalled();
        jest.runTimersToTime(0);
        expect(fn).toBeCalledWith(42);
    });
});