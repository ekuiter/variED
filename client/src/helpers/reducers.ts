export function uniqueArrayAdd<T>(array: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    elements = elements.filter((element, idx, array) => array.indexOf(element) === idx);
    return array.filter(element => !elements.includes(element)).concat(elements);
}

export function uniqueArrayRemove<T>(array: T[], elementOrElements: T | T[]): T[] {
    let elements: T[];
    elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements];
    return array.filter(element => !elements.includes(element));
}