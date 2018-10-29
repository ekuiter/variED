export type SetOperationFunction<T> = (array: T[], elementOrElements: T | T[]) => T[];

/**
 * Converts an array into a set by strict equality comparison.
 * @param array an array of elements
 */
export function arrayUnique<T>(array: T[]) {
    return array.filter((element, idx) => array.indexOf(element) === idx);
}

/**
 * Adds an element or an array of elements to a set.
 * Elements are kept unique with strict equality comparison.
 * @param set a set of elements
 * @param elementOrElements an element or an array of elements to be added
 */
export function setAdd<T>(set: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    elements = arrayUnique(elements);
    return set.filter(element => !elements.includes(element)).concat(elements);
}

/**
 * Removes an element or an array of elements from a set.
 * Elements are kept unique with strict equality comparison.
 * @param set a set of elements
 * @param elementOrElements an element or an array of elements to be removed
 */
export function setRemove<T>(set: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    return set.filter(element => !elements.includes(element));
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