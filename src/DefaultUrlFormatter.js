const filterKeys = (obj, remove = [null, undefined]) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !remove.includes(v)))
}

export default function DefaultUrlFormatter (baseUrl) {
  this.format = (action, queryParams) => {
    if (['show', 'update', 'destroy'].includes(action) && 'id' in queryParams) {
      baseUrl = baseUrl.replace(/(\.json)?$/, `/${queryParams.id}$1`)
      delete queryParams.id
    }

    const queryString = new URLSearchParams(filterKeys(queryParams))

    return `${baseUrl}${String(queryString) ? '?' + queryString : ''}`
  }
}
