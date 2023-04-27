import JsonApi from './JsonApi.js'

export default function JsonSingletonApi (baseUrl, options) {
  return new JsonApi(baseUrl, {
    ...options,
    FormatOptions: { format: (_, url) => url }
  })
}
