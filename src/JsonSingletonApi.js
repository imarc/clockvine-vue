import SingletonUrlFormatter from './SingletonUrlFormatter.js'
import JsonApi from './JsonApi.js'

export default function JsonSingletonApi (baseUrl, options) {
  return new JsonApi(baseUrl, { ...options, Formatter: SingletonUrlFormatter })
}
