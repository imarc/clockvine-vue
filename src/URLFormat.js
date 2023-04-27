import Params from './Params.js'

const URLFormat = function URLFormat ({
  format = URLFormat.config.format,
  includeNulls = URLFormat.config.includeNulls
} = {}) {
  return (baseUrl, action, queryParams, payload) => {
    const params = Params(queryParams, payload)
    const url = format(action, baseUrl, params)
    let unusedParams = params.getAll()

    if (!includeNulls) {
      unusedParams = Object.fromEntries(Object.entries(unusedParams).filter(([_, v]) => v != null))
    }

    const queryString = (new URLSearchParams(unusedParams)).toString()
    return url + (queryString ? '?' + queryString : '')
  }
}

URLFormat.config = {
  format: (action, url, { id }) => ['show', 'update', 'destroy'].includes(action) ? `${url}/${id}` : url,
  includeNulls: false
}

export default URLFormat
