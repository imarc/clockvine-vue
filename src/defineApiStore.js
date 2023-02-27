import { defineStore } from 'pinia'
import { reactive, toRef, computed, unref, isRef, isReactive, toRefs } from 'vue'

import JsonApi from './JsonApi'

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
    const elements = reactive({})
    const indexes = reactive({})

    const deleteElement = (element) => {
      const key = element[idField]
      delete elements[key]
      return element
    }

    /**
     *
     * @param {mixed} id
     *     The primary key of the element to fetch.
     */
    const fetchElement = async id => {
      const element = await api.show(id)
      return setElement(id, element)
    }

    const fetchIndex = async (params = {}) => {
      const key = api.key('index', params)
      const { data, meta } = await api.index(params)
      setElements(data)
      return setIndex(key, { data, meta })
    }

    const setElement = (key, element) => {
      elements[key] = reactive(element)
      return elements[key]
    }

    const setElements = elements => {
      elements.forEach(element => setElement(element[idField], element))
    }

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
     * @param {Object} element
     *
     * @returns {Object}
     *     Returns the deleted element.
     */
    const destroy = async element => {
      element = await api.destroy(element)
      return deleteElement(element)
    }

    /**
     * Get a ref for an element index for the given params.
     *
     * @param {Object} params
     * @returns {ref}
     */
    const index = (params = {}) => {
      const key = computed(() => api.key('index', unref(params)))

      return computed(() => {
        if (!(key.value in indexes)) {
          indexes[key.value] = { data: undefined, meta: undefined }
          fetchIndex(unref(params))
        }

        return toRefs(indexes[key.value])
      })
    }

    /**
     * Return a ref to an element for the given primary key. The element does
     * not need to exist before this is called.
     *
     * If idRef is a reference, than reactivity will be respected and when it
     * changes, the value of the returned ref will also change.
     *
     * @param {ref|mixed} idRef
     *     Primary key or a ref to a primary key.
     * @returns  {ref}
     */
    const show = idRef => {
      idRef = unref(idRef)
      if (idRef == null) {
        return
      }
      if (!(idRef in elements)) {
        elements[idRef] = undefined
        fetchElement(idRef)
      }

      return toRef(elements, idRef)
    }

    /**
     * Create a new element.
     *
     * @param {Object} element
     *
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
     * @param {Object} element
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
