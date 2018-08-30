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
});