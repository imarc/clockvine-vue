import { compile, pathToRegexp } from 'path-to-regexp'

import AccessObserver from './AccessObserver.js'
import StackObjects from './StackObjects.js'

export default class UrlExp {
  #pattern
  #regexp
  #toPath

  constructor (pattern, regexp = null, toPath = null) {
    this.#pattern = pattern
    this.#regexp = regexp ?? pathToRegexp(pattern)
    this.#toPath = toPath ?? compile(pattern, { encode: encodeURIComponent })
  }

  format (args = {}, optionalArgs = {}) {
    if (typeof args !== 'object') {
      console.log('args must be an object', args)
      throw new Error('args must be an object')
    }
    const observer = new AccessObserver()
    const observed = observer.observe(args)
    const path = this.#toPath(StackObjects(observed, optionalArgs))
    const accessedKeys = observer.accessedKeys()
    const params = new URLSearchParams(Object.fromEntries(Object.entries(args).filter(([key, val]) => val !== undefined && !accessedKeys.includes(key))))
    return path + (params.toString() ? `?${params.toString()}` : '')
  }
}
