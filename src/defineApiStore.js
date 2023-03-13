import { defineStore } from 'pinia'
import { reactive, ref, toRef, computed, unref, isRef, isReactive, toRefs } from 'vue'

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
  if (typeof api === 'string') {
    api = new JsonApi(api)
  }

  return defineStore(name, () => {
    /**
     * elements store
     *
     * @public
     */
    const elements = reactive({})

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
        if (!(id in elements)) {
          elements[id] = undefined
          api.show(id).then(element => mergeElement(id, element))
        }

        return elements[id]
      })
    }

    /**
      * @param {ref|object<ref>} params
      * @return {ref}  computed reference to elements[id]
      */
    const index = (paramsRef = {}) => {
      return computed(() => {
        const params = nestedUnref(paramsRef)
        const key = api.key('index', params)

        if (!(key in indexState) || indexState[key] === INVALID) {
          indexes[key] = reactive({})
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

    const newIndex = (paramsRef = {}) => {
      return new Proxy({}, {
        get (target, prop, receiver) {
          return computed(() => {
            const params = nestedUnref(paramsRef)
            const key = api.key('index', params)

            if (!(key in indexes)) {
              indexes[key] = reactive({})
              api.index(params).then(index => setIndex(key, index))
            }

            return indexes[key][prop]
          })
        }
      })
    }

    const indexRefs = (paramsRef = {}) => {
      const indexRef = index(paramsRef)

      return Object.fromEntries(
        [indexDataField, indexMetaField].map(key => [key, computed(() => unref(indexRef)[key])])
      )
    }



    /**
     * @param {ref|object<ref>} element
     * @return {ref} computed reference to the new element
     */
    const store = async element => {
      const newElement = await api.store(nestedUnref(element))
      invalidateAllIndexes()
      return mergeElement(newElement[idField], newElement)
    }

    const update = async element => {
      const updatedElement = await api.update(element)
      const id = idField in updatedElement ? updatedElement[idField] : element[idField]
      return mergeElement(id, updatedElement)
    }

    const destroy = async element => {
      const deletedElement = await api.destroy(element)
      invalidateAllIndexes()
      return deleteElement(deletedElement)
    }

    return { destroy, index, newIndex, indexRefs, show, store, update, invalidateIndex }
  })
}
