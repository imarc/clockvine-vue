/**
 * templates should be an object with a 'default' key and additional action-specific keys if you'd like.
 *
 * {
 *   default: '/api/endpoint',
 *   store: ({ id }) => `/api/endoppoint/:id/store`,
 * }
 *
 * This allows for validation/destructuring per action.
 *
 * @param templates Object
 */
export default function UrlFormatter (templates = {}) {
  this.format = (action, queryParams, payload = {}) => {
    const template = action in templates ? templates[action] : templates.default
    const usedQueryParams = new Set()
    const queryParamProxy = new Proxy(payload, {
      get: function (_, prop) {
        if (prop in queryParams) {
          usedQueryParams.add(prop)
          return usedQueryParams[prop]
        }

        return Reflect.get(...arguments)
      }
    })

    const baseUrl = typeof template === 'function' ? template(queryParamProxy) : template

    const remainingQueryParams = Object.fromEntries(
      Object.entries(queryParams)
        .filter(([k, v]) => !usedQueryParams.has(k) && ![null, undefined].includes(v)))
    const queryString = new URLSearchParams(remainingQueryParams)

    return `${baseUrl}${queryString ? '?' + queryString : ''}`
  }
}
