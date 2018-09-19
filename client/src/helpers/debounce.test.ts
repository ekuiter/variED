import debounce from './debounce';

jest.useFakeTimers();

describe('debounce', () => {
    it('debounces execution of a function to only run after an idle interval has passed', () => {
        const fn = jest.fn(),
            debounced = debounce(fn, 100);
        expect(fn).not.toBeCalled();
        debounced(42);
        jest.runTimersToTime(50);
        expect(fn).not.toBeCalled();
        debounced(42);
        jest.runTimersToTime(50);
        expect(fn).not.toBeCalled();
        jest.runTimersToTime(50);
        expect(fn).toBeCalledWith(42);
    });
});