export default function useXsrfTokens (
  jsonApi,
  {
    tokenHeader = 'X-XSRF-TOKEN',
    cookieRegex = /XSRF-TOKEN=([^; ]*)/,
    additionalHeaders = {
      Accept: 'application/json'
    }
  } = {}
) {
  const fetch = jsonApi.config.fetch

  jsonApi.config.fetch = (resource, options = {}) => {
    const headers = new Headers(options.headers || {})

    if (cookieRegex.test(document.cookie)) {
      const token = decodeURIComponent(document.cookie.match(cookieRegex)[1])
      headers.set(tokenHeader, token)
    }

    for (const header in additionalHeaders) {
      if (!headers.has(header)) {
        headers.set(header, additionalHeaders[header])
      }
    }

    options.headers = headers

    return fetch(resource, options)
  }
}
