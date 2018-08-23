export default fn => (...args) =>
    window.setTimeout(() => fn(...args), 0);