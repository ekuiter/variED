export function uniqueArrayAdd(array, element) {
    let index = array.findIndex(_element => _element === element);
    if(index === -1)
        return [...array, element];
    return array;
}

export function uniqueArrayRemove(array, element) {
    return array.filter(_element => _element !== element);
}