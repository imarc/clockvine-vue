export default function JsonApi (baseUrl) {
  const createQueryUrl = function (action) {
    if (['show', 'update', 'destroy'].includes(action)) {
      return baseUrl
    } else {
      throw new Error(`Invalid action ${action} on JsonSingletonApi endpoint.`)
    }
  }

  this.key = createQueryUrl

  this.show = async function (id) {
    const url = createQueryUrl('show', id)
    return fetch(url).then(r => r.json()).then(r => r.data)
  }
}
