import { defineStore } from 'pinia'
import { reactive, toRef, computed, unref, isRef, isReactive, toRefs } from 'vue'

import JsonApi from './JsonApi'

const unrefAttributes = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, unref(v)]))

/**
 * defineApiStore() is a constructor function for Clockvine API stores. It uses Pinia internally.
 *
 * @param string name
 *     The name (or ID) for for the Pinia store.
 * @param object|string api
 *     An API or endpoint URL for a JsonApi instance.
 * @param object options = {
 *     idField (default: 'id')
 *         Specify the field to use as the primary key for this store.
 * }
 */
export default function defineApiStore (name, api, { idField = 'id' } = {}) {
  if (typeof api === 'string') {
    api = new JsonApi(api)
  }

  const useElementStore = defineStore(name, () => {

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
     * fetch an element from the API and set it.
     *
     * @internal
     * @param {mixed} id  The primary key of the element to fetch.
   *   @return {ref}
     */
    const fetchElement = async id => {
      const element = await api.show(id)
      return setElement(id, element)
    }

    /**
     * Asyncronous function that returns a fetched { data, meta } index.
     *
     * @internal
     * @param {object} params
     * @return { data, meta }
     */
    const fetchIndex = async (params = {}) => {
      const key = api.key('index', params)
      const { data, meta } = await api.index(params)
      setElements(data)
      return setIndex(key, { data, meta })
    }

    /**
     * Sets an element and returns a reactive version of it.
     *
     * @internal
     * @param {string|number} key
     * @param {object} element
     * @return {ref}
     */
    const setElement = (key, element) => {
      elements[key] = reactive(element)
      return elements[key]
    }

    /**
     * Sets elements in mass with no return.
     *
     * @internal
     * @param {array} elements
     */
    const setElements = elements => {
      elements.forEach(element => setElement(element[idField], element))
    }

    /**
     * Sets an index and returns it.
     *
     * @internal
     * @param {string} key
     * @param { data: array, meta: object }
     * @return {object}
     */
    const setIndex = (key, { data = [], meta = {} }) => {
      Object.assign(indexes[key], { data, meta })
      return indexes[key]
    }

    //
    // Actions
    //

    /**
     * Delete an element.
     *
     * @public
     * @param {object} element
     * @returns {object}
     *     Returns the deleted element.
     */
    const destroy = async element => {
      element = await api.destroy(element)
      return deleteElement(element)
    }

    /**
     * Get a ref for an element index for the given params.
     *
     * @public
     * @param {object} params
     * @returns { data: ref, meta: ref }
     */
    const index = (params = {}) => {
      const key = computed(() => api.key('index', unrefAttributes(unref(params))))

      return {
        data: computed(() => {
          if (!(key.value in indexes)) {
            indexes[key.value] = { data: undefined, meta: undefined }
            fetchIndex(unrefAttributes(unref(params)))
          }

          return indexes[key.value].data
        }),
        meta: computed(() => {
          if (!(key.value in indexes)) {
            indexes[key.value] = { data: undefined, meta: undefined }
            fetchIndex(unrefAttributes(unref(params)))
          }

          return indexes[key.value].meta
        })
      }
    }

    /**
     * Return a ref to an element for the given primary key. The element does
     * not need to exist before this is called.
     *
     * If idRef is a reference, than reactivity will be respected and when it
     * changes, the value of the returned ref will also change.
     *
     * @public
     * @param {ref|mixed} idRef
     *     Primary key or a ref to a primary key.
     * @returns  {ref}
     */
    const show = idRef => {
      return computed(() => {
        if (idRef == null || idRef.value == null) {
          return
        }
        const id = isRef(idRef) ? idRef.value : idRef

        if (!(id in elements)) {
          elements[id] = undefined
          fetchElement(id)
        }

        return elements[id]
      })
    }

    /**
     * Create a new element.
     *
     * @public
     * @param {object} element
     * @returns {ref}
     *     The new element returned from the API and stored in Pinia.
     */
    const store = async (element = {}) => {
      const newElement = await api.store(element)
      setElement(element[idField], newElement)

      return toRef(elements, element[idField])
    }

    /**
     * Update an element.
     *
     * @public
     * @param {object} element
     * @returns {ref}
     */
    const update = async element => {
      element = await api.update(element)
      setElement(element[idField], element)

      return toRef(elements, element[idField])
    }

    return { index, show, store, update, destroy, elements, indexes }
  })

  return useElementStore
}
