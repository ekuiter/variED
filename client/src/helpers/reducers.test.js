import {uniqueArrayAdd, uniqueArrayRemove} from './reducers';

describe('reducers', () => {
    describe('uniqueArrayAdd', () => {
        it('adds an element to an array that does not include it', () => {
            expect(uniqueArrayAdd([1], 2)).toEqual([1, 2]);
        });

        it('does nothing if an array already includes an element', () => {
            expect(uniqueArrayAdd([1], 1)).toEqual([1]);
        });
    });

    describe('uniqueArrayRemove', () => {
        it('removes an element from an array that includes it', () => {
            expect(uniqueArrayRemove([1, 2], 2)).toEqual([1]);
        });

        it('does nothing if an array does not include an element', () => {
            expect(uniqueArrayRemove([1], 2)).toEqual([1]);
        });
    });
});