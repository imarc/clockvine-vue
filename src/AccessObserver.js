/**
 * AccessObserver returns Proxy for objects to provide some lightweight access tracking.
 */
export default class AccessObserver {
  #callback
  #accessedKeys = new Set()

  /**
   * Constructor
   *
   * @param {function} callback - called whenever a property of an observed object is accessed.
   */
  constructor (callback = () => {}) {
    this.#callback = callback
  }

  /**
   * Return all the keys for all properties accessed.
   *
   * @return {array}
   */
  accessedKeys () {
    return [...this.#accessedKeys]
  }

  /**
   * Return a Proxy for object obj.
   *
   * @param {object} obj
   * @return {Proxy}
   */
  observe (obj) {
    const callback = this.#callback
    return new Proxy(obj, {
      get: (target, key, receiver) => {
        if (Reflect.has(target, key)) {
          this.#accessedKeys.add(key)
          callback(target, key)
        }
        return Reflect.get(target, key, receiver)
      }
    })
  }
}
