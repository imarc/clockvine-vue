const filterKeys = (obj, remove = [null, undefined]) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !remove.includes(v)))
}

export default function JsonApi (baseUrl) {
  const createQueryUrl = function (action, params) {
    if (['show', 'update', 'destroy'].includes(action)) {
      const url = baseUrl.replace(/(\.json)?$/, `/${params}$1`)
      console.log(`hitting ${url}, ${action}, ${params}`)
      return url
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
}
