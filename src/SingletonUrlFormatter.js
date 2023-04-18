const filterKeys = (obj, remove = [null, undefined]) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => !remove.includes(v)))
}

export default function SingletonUrlFormatter (baseUrl) {
  this.format = (_, queryParams) => {
    const queryString = new URLSearchParams(filterKeys(queryParams))
    return `${baseUrl}${String(queryString) ? '?' + queryString : ''}`
  }
}
