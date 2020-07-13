/**
 * Internal use. retrieves a nested property from obj, using each element
 * within path as a key, but will always return null instead of throwing any
 * errors.
 *
 * @param {object} obj - Object to descending into
 * @param {array} path - Array of keys
 * @return {mixed}
 */
export function safelyGet (obj, path) {
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), obj)
};

/**
 * Internal use. Removes all instances of element from an array.
 *
 * @param {array} array - Array to modify.
 * @param {mixed} element - element to look for and remove
 * @return {array}
 */
export function spliceAll (array, element) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    if (array[i] === element) {
      array.splice(i, 1)
    }
  }

  return array
};

/**
 * Internal use. Populates a string using values from the params object, and
 * deletes used keys from the params object.
 *
 * This looks within the string for two patterns:
 *
 *     {KEY?truthy:falsy} and {prefixKEYsuffix}
 *
 * For the first pattern, if KEY exists in params and its value is truthy,
 * it'll be replaced with truthy, otherwise, it's replaced by falsy. If truthy
 * isn't specified, it uses the value of params[KEY].
 *
 * For the second pattern, if KEY exists in params and its value is truthy,
 * it'll be replaced with params[KEY], and prefixes/suffixes are carried over,
 * otherwise it's all removed. Prefixes and Suffixes have to be non-WORD
 * characters.
 *
 * Examples using the params object {"id": "1", "slug": "example"}:
 *
 *   - /article/{id}-{slug}       => /article/1-example
 *   - /api/articles{/id}         => /api/articles/1
 *   - /news/{id}-{slug?:article} => /news/article/1-example
 *   - /news/{id?foo:bar}         => /news/foo
 *
 * More with the params object {"id": "1"}:
 *
 *   - /article/{id}{-slug}       => /article/1
 *   - /api/articles{/slug}       => /api/articles
 *   - /news/{id}-{slug?:article} => /news/article/1-article
 *   - /news/{id?foo:bar}         => /news/foo
 *
 * @param {string} str - string to populate
 * @param {object} params - parameters used.
 */
export function populateStr (str, params = {}, availableParams = {}) {
  const ternaryRegex = /\{([^}]+)\?([^}]*):([^}]+)\}/g
  const paramRegex = /\{(\W*)(\w+)(\W*)\}/g
  const usedParams = []
  let newStr = str.replace(ternaryRegex, (m, key, truthy, falsy) => {
    if (key in params && params[key]) {
      usedParams.push(key)
      return truthy || `{${key}}`
    } else if (key in availableParams && availableParams[key]) {
      return truthy || `{${key}}`
    }
    return falsy
  })

  newStr = newStr.replace(paramRegex, (m, prefix, key, suffix) => {
    if (params[key]) {
      usedParams.push(key)
      return prefix + params[key] + suffix
    } else if (availableParams[key]) {
      return prefix + availableParams[key] + suffix
    }

    return ''
  })

  usedParams.forEach(key => {
    delete params[key]
  })

  return newStr
};
