import UrlExp from './UrlExp.js'

/**
 * @typedef {(element: Element, params: Object, overrides: Object) => Promise} Action
 * @typeDef {(args: Object, optionalArgs: Object) => string} ToUrl
 *
 * @typedef {({
 *   put: Action,
 *   update: Action,
 *   delete: Action,
 *   destroy: Action,
 *   post: Action,
 *   store: Action,
 *   get: Action,
 *   show: Action,
 *   index: Action,
 *   key: (params: Object) => string,
 * })} JsonApi
 *
 */

/**
 * @param {String|UrlExp|((args: Object, optionalArgs: Object) => string)} url
 * @return ToUrl
 */
const makeToUrl = url => {
  if (url instanceof UrlExp) {
    return url.format.bind(url)
  } else if (typeof url === 'string') {
    const exp = new UrlExp(url)
    return exp.format.bind(exp)
  } else if (typeof url === 'function') {
    return url
  } else {
    throw new TypeError('url must be a UrlExp, function, or string')
  }
}

/**
 * @param {String|UrlExp|((args: Object, optionalArgs: Object) => string)} urlExp
 * @param {Object} options
 * @param {Function} options.fetch
 * @param {Object} options.headers
 * @param {Function} options.seralize
 *
 * @return {JsonApi}
 */
const JsonApi = function JsonApi (urlExp, {
  fetch = JsonApi.config.fetch,
  headers = JsonApi.config.headers,
  serialize = JsonApi.config.serialize
} = {}) {
  const toUrl = makeToUrl(urlExp)

  /**
   * @param {string} method
   * @return Action
   */
  const makeAction = method => {
    return async (element, params = {}, overrides = {}) => {
      const options = { method, headers, ...overrides }
      options.url = options.url ? makeToUrl(options.url)(params, element) : toUrl(params, element)
      if (!['get', 'head'].includes(method.toLowerCase())) {
        options.body = serialize(element)
      }
      return fetch(options.url, options)
        .then(response => {
          if (response.status > 399) {
            throw new Error(`${response.status} response for ${method} request to ${response.url}`)
          }
          return response
        })
        .then(r => r.json())
    }
  }

  /**
   * @param {string} action
   * @param {string} method
   * @return Action
   */
  this.defineAction = function (action, method = action) {
    /**
     * @param {Element} element
     * @param {Object} params
     * @param {Object} overrides
     * @return Action
     */
    this[action] = (element, params = {}, overrides = {}) => makeAction(method)(element, params, overrides).then(r => r.data)
  }

  this.key = params => toUrl(params)

  this.defineAction('delete')
  this.destroy = this.delete

  this.defineAction('put')
  this.update = this.put

  this.defineAction('post')
  this.store = this.post

  this.defineAction('get')
  this.show = this.get

  this.index = (element, params = {}, overrides = {}) => makeAction('get')(element, params, overrides)
}

JsonApi.config = {
  fetch,
  headers: { 'Content-Type': 'application/json' },
  serialize: JSON.stringify
}

JsonApi.use = plugin => plugin(JsonApi)

export default JsonApi
