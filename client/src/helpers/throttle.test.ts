import throttle from './throttle';

jest.useFakeTimers();

describe('throttle', () => {
    it('throttles execution of a function to at most once in an interval', () => {
        const fn = jest.fn(),
            throttled = throttle(fn, 100);
        expect(fn).not.toBeCalled();
        for (let i = 0; i < 10; i++) {
            throttled(i);
            jest.runTimersToTime(50);
        }
        expect(fn).toHaveBeenCalledTimes(5);
        for (let i = 0; i < 10; i += 2)
            expect(fn).toBeCalledWith(i);
    });
});