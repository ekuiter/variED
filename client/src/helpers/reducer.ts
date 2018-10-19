export type SetOperationFunction<T> = (array: T[], elementOrElements: T | T[]) => T[];

/**
 * Adds an element or an array of elements to a set.
 * @param array a set of elements
 * @param elementOrElements an element or an array of elements to be added
 */
export function setAdd<T>(array: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    elements = elements.filter((element, idx, array) => array.indexOf(element) === idx);
    return array.filter(element => !elements.includes(element)).concat(elements);
}

/**
 * Removes an element or an array of elements from a set.
 * @param array a set of elements
 * @param elementOrElements an element or an array of elements to be removed
 */
export function setRemove<T>(array: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    return array.filter(element => !elements.includes(element));
}