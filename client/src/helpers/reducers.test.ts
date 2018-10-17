import {setAdd, setRemove} from './reducers';

describe('reducers', () => {
    describe('setAdd', () => {
        it('adds an element to an array that does not include it', () => {
            expect(setAdd([1], 2)).toEqual([1, 2]);
        });

        it('does nothing if an array already includes an element', () => {
            expect(setAdd([1], 1)).toEqual([1]);
        });
    });

    describe('setRemove', () => {
        it('removes an element from an array that includes it', () => {
            expect(setRemove([1, 2], 2)).toEqual([1]);
        });

        it('does nothing if an array does not include an element', () => {
            expect(setRemove([1], 2)).toEqual([1]);
        });
    });
});