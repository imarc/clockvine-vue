/**
 * Internal use. retrieves a nested property from obj, using each element
 * within path as a key, but will always return null instead of throwing any
 * errors.
 *
 * @param {object} obj - Object to descending into
 * @param {array} path - Array of keys
 * @return {mixed}
 */
export function safelyGet(obj, path) {
    return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), obj);
};


/**
 * Internal use. Removes all instances of element from an array.
 *
 * @param {array} array - Array to modify.
 * @param {mixed} element - element to look for and remove
 * @return {array}
 */
export function spliceAll(array, element) {
    for (let i = array.length - 1; i >= 0; i-=1) {
        if (array[i] === element) {
            array.splice(i, 1);
        }
    }

    return array;
};


const ternaryRegex = /\{([^}]+)\?([^}]*):([^}]+)\}/g;
const paramRegex = /\{(\W*)(\w+)(\W*)\}/g;
/**
 *
 */
export function populateStr(str, params = {}) {
    const usedParams = [];
    let newStr = str.replace(ternaryRegex, (m, key, truthy, falsy) => {
        if (key in params && params[key]) {
            usedParams.push(key);
            return truthy || `{${key}}`;
        }
        return falsy;
    });

    newStr = newStr.replace(paramRegex, (m, prefix, key, suffix) => {
        if (params[key]) {
            usedParams.push(key);
            return prefix + params[key] + suffix;
        }

        return '';
    });

    usedParams.forEach(key => {
        delete params[key];
    });

    return newStr;
};
