export function uniqueArrayAdd(array, elements) {
    if (!Array.isArray(elements))
        elements = [elements];
    elements = elements.filter((element, idx, array) => array.indexOf(element) === idx);
    return array.filter(element => !elements.includes(element)).concat(elements);
}

export function uniqueArrayRemove(array, elements) {
    if (!Array.isArray(elements))
        elements = [elements];
    return array.filter(element => !elements.includes(element));
}