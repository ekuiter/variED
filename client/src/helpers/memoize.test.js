import memoize from './memoize';

describe('memoize', () => {
    it('caches function call results for the given arguments', () => {
        const fn = jest.fn((x, y = 0) => x * 2 + y);
        let memoized = memoize(fn);
        expect(fn).not.toBeCalled();

        expect(memoized(42)).toBe(84);
        expect(fn).toHaveBeenCalledTimes(1);

        expect(memoized(1337)).toBe(2674);
        expect(fn).toHaveBeenCalledTimes(2);

        expect(memoized(42)).toBe(84);
        expect(fn).toHaveBeenCalledTimes(2);

        expect(memoized(42, 7)).toBe(91);
        expect(fn).toHaveBeenCalledTimes(3);
        
        memoized = memoize(fn);
        expect(memoized(42)).toBe(84);
        expect(fn).toHaveBeenCalledTimes(4);
    });

    it('serializes complex arguments with a custom function', () => {
        const fn = jest.fn(fn => fn()),
            memoized = memoize(fn, fn => fn.name);
        expect(fn).not.toBeCalled();

        expect(memoized(function fortyTwo() {
            return 42;
        })).toBe(42);
        expect(fn).toHaveBeenCalledTimes(1);

        expect(memoized(function fortyTwo() {
            return 1337;
        })).toBe(42);
        expect(fn).toHaveBeenCalledTimes(1);

        expect(memoized(function leet() {
            return 1337;
        })).toBe(1337);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});