export type SetOperationFunction<T> = (array: T[], elementOrElements: T | T[]) => T[];

/**
 * Adds an element or an array of elements to a set.
 * Elements are kept unique with strict equality comparison.
 * @param set a set of elements
 * @param elementOrElements an element or an array of elements to be added
 * @param keyFn extracts a key, defaults to strict equality comparison
 */
export function setAdd<T>(set: T[], elementOrElements: T | T[], keyFn: (element: T) => any = element => element): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    elements = arrayUnique(elements, keyFn);
    return setRemove(set, elements, keyFn).concat(elements);
}

/**
 * Removes an element or an array of elements from a set.
 * Elements are kept unique with strict equality comparison.
 * @param set a set of elements
 * @param elementOrElements an element or an array of elements to be removed
 * @param keyFn extracts a key, defaults to strict equality comparison
 */
export function setRemove<T>(set: T[], elementOrElements: T | T[], keyFn: (element: T) => any = element => element): T[] {
    let elements: T[] = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    return set.filter(a => !elements.find(b => keyFn(a) === keyFn(b)));
}

/**
 * Converts an array into a set.
 * @param array an array of elements
 * @param keyFn extracts a key, defaults to strict equality comparison
 */
export function arrayUnique<T>(array: T[], keyFn: (element: T) => any = element => element) {
    return array.reduce((acc, val) => [...acc.filter(element => keyFn(element) !== keyFn(val)), val], []);
}

/**
 * Replaces matching elements in an array.
 * @param array an array of elements
 * @param findElementFn a function taking elements that returns true for the elements to be replaced
 * @param replacementFn a function that transforms the replaced element
 */
export function arrayReplace<T>(array: T[], findElementFn: (element: T) => boolean, replacementFn: (element: T) => T): T[] {
    return array.map(element => findElementFn(element) ? replacementFn(element) : element);
}