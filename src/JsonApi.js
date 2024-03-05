import UrlExp from './UrlExp.js'

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

const JsonApi = function JsonApi (urlExp, {
  fetch = JsonApi.config.fetch,
  headers = JsonApi.config.headers,
  serialize = JsonApi.config.serialize
} = {}) {
  const toUrl = makeToUrl(urlExp)

  const makeAction = method => {
    return async (element, params = {}, overrides = {}) => {
      const options = { method, headers, ...overrides }
      options.url = options.url ? makeToUrl(options.url)(params, element) : toUrl(params, element)
      if (!['get', 'head'].includes(method.toLowerCase())) {
        options.body = serialize(element)
      }
      return fetch(options.url, options).then(r => r.json())
    }
  }

  this.defineAction = function (action, method = action, options) {
    this[action] = (...args) => makeAction(method, options)(...args).then(r => r.data)
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
  this.index = this.get
}

JsonApi.config = {
  fetch,
  headers: { 'Content-Type': 'application/json' },
  serialize: JSON.stringify
}

JsonApi.use = plugin => plugin(JsonApi)

export default JsonApi
