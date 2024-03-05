import UrlExp from './UrlExp.js'

const JsonApi = function JsonApi (urlExp, {
  fetch = JsonApi.config.fetch,
  headers = JsonApi.config.headers,
  serialize = JsonApi.config.serialize
} = {}) {
  if (!(urlExp instanceof UrlExp)) {
    if (typeof urlExp === 'string') {
      urlExp = new UrlExp(urlExp)
    } else {
      throw new TypeError('urlExp must be a UrlExp or string')
    }
  }

  const makeAction = function (
    method,
    {
      beforeFetch = options => options,
      afterFetch = r => r.json()
    } = {}
  ) {
    return async (element, params = {}) => {
      const url = urlExp.format(params, element)
      const options = { url, method, headers }
      if (!['get', 'head'].includes(method.toLowerCase())) {
        options.body = serialize(element)
      }
      beforeFetch(options)
      return fetch(options.url, options).then(afterFetch)
    }
  }

  this.defineAction = function (action, method = action, ...args) {
    this[action] = (element, params = {}) => makeAction(method, ...args)(element, params).then(r => r.data)
  }

  this.key = params => urlExp.format(params)

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
