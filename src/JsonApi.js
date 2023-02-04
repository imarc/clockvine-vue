export default function JsonApi (baseUrl) {
  const createQueryUrl = function (action, params) {
    if (['show', 'update', 'destroy'].includes(action)) {
      return baseUrl.replace(/\.json$/, `/${params}.json`)
    } else {
      const queryString = new URLSearchParams(params)
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
    return fetch(url).then(r => r.json())
  }
}
