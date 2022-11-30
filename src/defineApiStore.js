import { defineStore } from 'pinia'
import { reactive, toRef, computed, unref, isRef, readonly } from 'vue'

import JsonApi from './JsonApi'

/**
 * defineApiStore() is a constructor function for Clockvine API stores. It uses Pinia internally.
 *
 * @param string name
 *     The name (or ID) for for the Pinia store.
 * @param object|string api
 *     An API or endpoint URL for a JsonApi instance.
 * @param object options = {
 *   idField
 * }
 */
export default function defineApiStore (name, api, { idField = 'id' } = {}) {
  if (typeof api === 'string') {
    api = new JsonApi(api)
  }

  const useElementStore = defineStore(name, () => {
    const elements = reactive({})
    const indexes = reactive({})

    const setIndex = (key, { data = [], meta = {} }) => {
      indexes[key] = { data, meta }
      return indexes[key]
    }

    const setElement = (key, element) => {
      elements[key] = reactive(element)
      return elements[key]
    }

    const deleteElement = (element) => {
      const key = element[idField]
      console.log('deleteElement', key, elements)
      delete elements[key]
      console.log('deleteElement', key, elements)
      return element
    }

    const setElements = elements => {
      elements.forEach(element => setElement(element[idField], element))
    }

    const fetchIndex = async (params = {}) => {
      const key = api.key('index', params)
      const { data, meta } = await api.index(params)
      setElements(data)
      return setIndex(key, { data, meta })
    }

    const index = (params = {}) => {
      const key = computed(() => api.key('index', params))

      if (!(key.value in indexes)) {
        fetchIndex(params)
      }

      return toRef(indexes, key.value)
    }

    const fetchElement = async id => {
      const element = await api.show(id)
      return setElement(id, element)
    }

    const show = idRef => {
      if (unref(idRef) == null) {
        return
      }
      if (!(unref(idRef) in elements)) {
        fetchElement(unref(idRef))
      }

      return toRef(elements, unref(idRef))
    }

    const store = async (params = {}) => {
      const element = await api.store(params)
      return setElement(element[idField], element)
    }

    const update = async element => {
      element = await api.update(element)
      return setElement(element[idField], element)
    }

    const destroy = async element => {
      console.log('destroy', element)
      element = await api.destroy(element)
      console.log('api.destroy response', element)
      return deleteElement(element)
    }

    return { index, show, store, update, destroy, elements, indexes }
  })

  return useElementStore
}
