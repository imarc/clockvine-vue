import { defineStore } from 'pinia'
import { reactive, toRef, computed, unref } from 'vue'

import JsonApi from './JsonApi'

const nestedUnref = obj => {
  const result = Object.fromEntries(Object.entries(unref(obj)).map(([k, v]) => [k, unref(v)]))
  return result
}

const LOADING = 'LOADING'
const VALID = 'VALID'
const INVALID = 'INVALID'

export default function defineApiStore (
  name,
  api,
  {
    idField = 'id',
    indexDataField = 'data',
    indexMetaField = 'meta'
  } = {}
) {
  if (typeof api === 'string' || typeof api === 'function') {
    api = new JsonApi(api)
  }

  return defineStore(name, () => {
    /**
     * elements store
     *
     * @public
     */
    const elements = reactive({})
    const elementState = reactive({})

    /**
     * indexes store
     *
     * @public
     */
    const indexes = reactive({})
    const indexState = reactive({})

    // =========================================================================
    // = Low Level
    // =========================================================================

    /**
     * Delete an element.
     *
     * @internal
     * @param {object} element
     * @return {object}
     */
    const deleteElement = (element) => {
      const key = element[idField]
      delete elementState[key]
      delete elements[key]
      return element
    }

    /**
     * Sets an element and returns a reactive version of it.
     *
     * @internal
     * @param {string|number} key
     * @param {object} element
     * @return {ref}
     */
    const mergeElement = (key, element) => {
      const oldElement = unref(elements[key]) === undefined ? {} : unref(elements[key])
      elements[key] = Object.assign(oldElement, element)
      elementState[key] = VALID
      return toRef(elements, key)
    }

    /**
     * Sets elements in mass with no return.
     *
     * @internal
     * @param {array} elements
     */
    const mergeElements = elements => {
      return elements.map(element => mergeElement(element[idField], element))
    }

    /**
     * Sets an index and returns it.
     *
     * @internal
     * @param {string} key
     * @param { data: array, meta: object }
     * @return {object}
     */
    const setIndex = (key, index) => {
      index[indexDataField] = mergeElements(index[indexDataField]).map(unref)
      indexes[key] = index
      return toRef(indexes, key)
    }

    // =========================================================================
    // = High Level
    // =========================================================================

    /**
      * @param {ref|mixed} idRef
      * @return {ref}  computed reference to elements[id]
      */
    const show = idRef => {
      return computed(() => {
        const id = unref(idRef)
        if (!(id in elementState) || elementState[id] === INVALID) {
          elements[id] = elements[id] || undefined
          elementState[id] = LOADING
          api.show(id).then(element => {
            const newElement = mergeElement(id, element)
            elementState[id] = VALID
            return newElement
          })
        }

        return elements[id]
      })
    }

    /**
     * @param {ref|mixed} elementOrIdRef
     */
    const invalidate = elementOrIdRef => {
      let elementOrId = unref(elementOrIdRef)
      if (typeof elementOrId === 'object' && idField in elementOrId) {
        elementOrId = elementOrId[idField]
      }

      elementState[elementOrId] = INVALID
    }

    /**
      * @param {ref|object<ref>} params
      * @return {ref}  computed reference to elements[id]
      */
    const indexAsRef = (paramsRef = {}) => {
      return computed(() => {
        const params = nestedUnref(paramsRef)
        const key = api.key('index', params)

        if (!(key in indexState) || indexState[key] === INVALID) {
          indexes[key] = indexes[key] || reactive({})
          indexState[key] = LOADING
          api.index(params).then(index => {
            const newIndex = setIndex(key, index)
            indexState[key] = VALID
            return newIndex
          })
        }

        return indexes[key]
      })
    }

    const invalidateIndex = (paramsRef = {}) => {
      const params = nestedUnref(paramsRef)
      const key = api.key('index', params)

      indexState[key] = INVALID
    }

    const invalidateAllIndexes = () => {
      for (const key in indexState) {
        indexState[key] = INVALID
      }
    }

    const index = (paramsRef = {}) => {
      return new Proxy({}, {
        get (target, prop, receiver) {
          return computed(() => {
            const params = nestedUnref(paramsRef)
            const key = api.key('index', params)

            if (!(key in indexState) || indexState[key] === INVALID) {
              indexes[key] = indexes[key] || reactive({})
              indexState[key] = LOADING
              api.index(params).then(index => {
                const newIndex = setIndex(key, index)
                indexState[key] = VALID
                return newIndex
              })
            }

            return indexes[key][prop]
          })
        }
      })
    }

    /**
     * @param {ref|object<ref>} element
     * @return {ref} computed reference to the new element
     */
    const store = async (element, params = {}) => {
      const newElement = await api.store(nestedUnref(element), params)
      invalidateAllIndexes()
      return mergeElement(newElement[idField], newElement)
    }

    const update = async element => {
      const updatedElement = await api.update(element)
      const id = idField in updatedElement ? updatedElement[idField] : element[idField]
      invalidateAllIndexes()
      return mergeElement(id, updatedElement)
    }

    const destroy = async element => {
      const deletedElement = await api.destroy(element)
      invalidateAllIndexes()
      return deleteElement(deletedElement)
    }

    return {
      destroy,
      index,
      indexAsRef,
      invalidate,
      invalidateIndex,
      invalidateAllIndexes,
      show,
      store,
      update,
    }
  })
}
