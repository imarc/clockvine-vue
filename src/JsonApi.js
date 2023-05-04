import TrackUsed from './TrackUsed.js'
import StackObjects from './StackObjects.js'

const JsonApi = function JsonApi (baseUrl, {
  fetch = JsonApi.config.fetch,
  headers = JsonApi.config.headers,
  serialize = JsonApi.config.serialize
} = {}) {
  if (typeof baseUrl !== 'string') {
    throw new TypeError('baseUrl must be a string')
  }

  const makeAction = function (
    method,
    format = url => url,
    {
      beforeFetch = options => options,
      afterFetch = r => r.json()
    } = {}
  ) {
    return async (element, params = {}) => {
      const queryParams = TrackUsed(params)
      const url = format(baseUrl, StackObjects(queryParams, element))
      const queryString = (new URLSearchParams(queryParams.getUnused())).toString()
      const options = {
        url: url + (queryString ? '?' + queryString : ''),
        method,
        headers
      }
      if (!['get', 'head'].includes(method.toLowerCase())) {
        options.body = serialize(element)
      }
      beforeFetch(options)
      return fetch(options.url, options).then(afterFetch)
    }
  }

  this.defineAction = function (action, ...args) {
    this[action] = (element, params = {}) => makeAction(...args)(element, params).then(r => r.data)
  }

  this.index = makeAction('get')
  this.key = params => {
    const queryString = (new URLSearchParams(params)).toString()
    return baseUrl + (queryString ? '?' + queryString : '')
  }

  this.defineAction('delete', 'delete', (url, { id }) => `${url}/${id}`)
  this.destroy = this.delete

  this.defineAction('put', 'put', (url, { id }) => `${url}/${id}`)
  this.update = this.put

  this.defineAction('post', 'post')
  this.store = this.post

  this.defineAction('get', 'get', (url, { id }) => `${url}/${id}`)
  this.show = async id => this.get(undefined, { id })
}

JsonApi.config = {
  fetch: window.fetch,
  headers: { 'Content-Type': 'application/json' },
  serialize: JSON.stringify
}

JsonApi.use = plugin => plugin(JsonApi)

export default JsonApi
