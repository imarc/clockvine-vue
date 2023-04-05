const TOKEN_REGEX = /XSRF-TOKEN=([^; ]*)/

export default function XsrfFetch (defaultOptions = {}) {
  const headers = new Headers(defaultOptions.headers || {})

  if (TOKEN_REGEX.test(document.cookie)) {
    const token = decodeURIComponent(document.cookie.match(TOKEN_REGEX)[1])
    headers.set('X-XSRF-TOKEN', token)
  }

  defaultOptions.headers = headers

  return (resource, options = {}) => {
    const headers = new Headers(defaultOptions.headers)
    if (options.headers) {
      (new Headers(options.headers)).forEach((value, key) => {
        headers.set(key, value)
      })
    }
    return fetch(resource, Object.assign({}, defaultOptions, options, { headers }))
  }
}
