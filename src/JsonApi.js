const filterKeys = (obj, remove = [null, undefined]) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !remove.includes(v)))
}

export default function JsonApi (baseUrl) {
  const createQueryUrl = function (action, params, element) {
    if (typeof baseUrl === 'function') {
      baseUrl = baseUrl(action, params, element)
    }

    if (['show', 'update', 'destroy'].includes(action)) {
      return baseUrl.replace(/(\.json)?$/, `/${params}$1`)
    } else {
      const queryString = new URLSearchParams(filterKeys(params))
      return `${baseUrl}?${queryString}`
    }
  }

  this.key = createQueryUrl

  this.index = async function (params) {
    const url = createQueryUrl('index', params)
    return fetch(url).then(r => r.json())
  }

  this.show = async function (id) {
    const url = createQueryUrl('show', id)
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
