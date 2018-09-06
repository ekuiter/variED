export function uniqueArrayAdd(array, ...elements) {
    return array.filter(element => !elements.includes(element)).concat(elements);
}

export function uniqueArrayRemove(array, ...elements) {
    return array.filter(element => !elements.includes(element));
}