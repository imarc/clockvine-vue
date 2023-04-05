import DefaultUrlFormatter from './DefaultUrlFormatter.js'

export default function JsonApi (baseUrl, {
  fetch = window.fetch,
  Formatter = DefaultUrlFormatter
} = {}) {
  const createQueryUrl = (new Formatter(baseUrl)).format

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
      body: JSON.stringify(element)
    }
    return fetch(url, options).then(r => r.json()).then(r => r.data)
  }
}
