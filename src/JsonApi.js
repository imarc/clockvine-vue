export default function JsonApi (baseUrl) {
  this.key = function (action, params) {
    if (['show', 'update', 'destroy'].includes(action)) {
      return baseUrl.replace(/\.json$/, `/${params}.json`)
    } else {
      const queryString = new URLSearchParams(params)
      return `${baseUrl}?${queryString}`
    }
  }

  this.index = async function (params) {
    const url = this.key('index', params)
    return fetch(url).then(r => r.json())
  }

  this.show = async function (id) {
    const url = this.key('show', id)
    return fetch(url).then(r => r.json())
  }
}
