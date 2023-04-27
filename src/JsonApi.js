import URLFormat from './URLFormat.js'

const JsonApi = function JsonApi (baseUrl, {
  fetch = JsonApi.config.fetch,
  Format = JsonApi.config.Format,
  serialize = JsonApi.config.serialize
} = {}) {
  const createQueryUrl = (new Format(baseUrl)).format
  this.key = createQueryUrl

  this.index = async function (params) {
    const url = createQueryUrl('index', params)
    return fetch(url).then(r => r.json())
  }

  this.show = async function (id) {
    const url = createQueryUrl('show', { id })
    return fetch(url).then(r => r.json()).then(r => r.data)
  }

  this.store = async function (element, params = {}) {
    const url = createQueryUrl('store', params, element)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: serialize(element)
    }
    return fetch(url, options).then(r => r.json()).then(r => r.data)
  }

  this.update = async function (element, params = {}) {
    const url = createQueryUrl('update', params, element)
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: serialize(element)
    }
    return fetch(url, options).then(r => r.json()).then(r => r.data)
  }

  this.destroy = async function (element, params = {}) {
    const url = createQueryUrl('destroy', params, element)
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: serialize(element)
    }
    return fetch(url, options).then(r => r.json()).then(r => r.data)
  }
}

JsonApi.config = {
  fetch,
  Format: URLFormat,
  serialize: JSON.stringify
}

JsonApi.use = plugin => plugin(JsonApi)

export default JsonApi
