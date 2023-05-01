import URLFormat from './URLFormat.js'

const JsonApi = function JsonApi (baseUrl, {
  fetch = JsonApi.config.fetch,
  formatURL = JsonApi.config.formatURL(JsonApi.config.URLFormatOptions),
  headers = JsonApi.config.headers,
  serialize = JsonApi.config.serialize
} = {}) {
  if (typeof baseUrl !== 'string') {
    throw new TypeError('baseUrl must be a string')
  }

  const createQueryUrl = (action, params, payload) => formatURL(baseUrl, action, params, payload)
  this.key = createQueryUrl

  this.index = async function (params) {
    const url = createQueryUrl('index', params)
    return fetch(url).then(r => r.json())
  }

  this.defineAction = function (action, method = action, callback = options => options) {
    this[action] = async (element, params = {}) => {
      const url = createQueryUrl(action, params, element)
      const options = { url, method, headers, body: serialize(element) }
      callback(options)
      return fetch(options.url, options).then(r => r.json()).then(r => r.data)
    }
  }

  this.defineAction('delete')
  this.destroy = this.delete

  this.defineAction('put')
  this.update = this.put

  this.defineAction('post')
  this.store = this.post

  this.defineAction('get')
  this.show = async id => this.get(undefined, { id })

  this.defineAction('show', 'GET', options => {
    delete options.body
    options.url = createQueryUrl('show', options.params)
  })
}

JsonApi.config = {
  fetch: window.fetch,
  formatURL: URLFormat,
  headers: { 'Content-Type': 'application/json' },
  URLFormatOptions: undefined,
  serialize: JSON.stringify
}

JsonApi.use = plugin => plugin(JsonApi)

export default JsonApi
