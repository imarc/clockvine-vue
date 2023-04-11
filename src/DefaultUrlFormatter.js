import { unref, isRef, isReactive } from 'vue'

const filterKeys = (obj, remove = [null, undefined]) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !remove.includes(v)))
}

export default function DefaultUrlFormatter (baseUrl) {
  this.format = (action, queryParams, payload) => {
    const id = queryParams?.id || payload?.id
    if (['show', 'update', 'destroy'].includes(action) && ![null, undefined].includes(id)) {
      const url = baseUrl.replace(/(\.json)?$/, `/${id}$1`)
      const queryString = new URLSearchParams(filterKeys({ ...queryParams, id: undefined }))
      return url + (String(queryString) ? '?' + String(queryString) : '')
    }

    const queryString = new URLSearchParams(filterKeys(queryParams))
    return `${baseUrl}${String(queryString) ? '?' + queryString : ''}`
  }
}
