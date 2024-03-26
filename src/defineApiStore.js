import { defineStore } from 'pinia'
import { shallowReactive, reactive, ref, toRef, computed, toValue, isRef, isReactive } from 'vue'
import JsonApi from './JsonApi'

/**
 * @typedef {Object} Element
 * @typedef {reactive} Index
 * @typedef {(number|string)} Id
 */

/**
 * Returns a new object with toValue() called on all properties of the object obj.
 *
 * @param {Object} obj
 */
const nestedToValue = (obj) => {
  const result = Object.fromEntries(
    Object.entries(toValue(obj)).map(([k, v]) => [k, toValue(v)])
  )
  return result
}

const LOADING = 'LOADING'
const VALID = 'VALID'
const INVALID = 'INVALID'

/**
 * @param {string} name
 * @param {string|JsonApi} api
 *
 * @return {import('pinia').StoreDefinition}
 */
const defineApiStore = function defineApiStore (
  name,
  api,
  {
    idField = defineApiStore.config.idField,
    indexDataField = defineApiStore.config.indexDataField,
    showRequiresKey = defineApiStore.config.showRequiresKey
  } = {},
  apiActions = {}
) {
  if (typeof name !== 'string') {
    throw new Error('Store name must be a string.')
  }

  if (typeof api === 'string') {
    api = new JsonApi(api, defineApiStore.config.ApiOptions)
  }

  return defineStore(name, () => {
    /**
     * elements store
     *
     * @type {reactive<Element>}
     */
    const elements = reactive({})

    /**
     * @type {reactive<String>}
     */
    const elementState = reactive({})

    /**
     * indexes store
     *
     * @type {reactive<string, Index>}
     */
    const indexes = reactive({})

    /**
     * @type {reactive<String>}
     */
    const indexState = reactive({})

    /**
     * Custom actions.
     *
     * @type {Object<string, (element: Element, params: Object) => Element>}
     */
    const actions = {}

    // =========================================================================
    // = Low Level
    // =========================================================================

    /**
     * Delete an element.
     *
     * @internal
     * @param {Element} element
     * @return {Element}
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
     * @param {Id} key
     * @param {Element} element
     * @return {ref<Element>}
     */
    const mergeElement = (key, element) => {
      elements[key] = Object.assign({}, elements[key], element)
      elementState[key] = VALID
      return toRef(elements, key)
    }

    /**
     * Sets elements in mass with no return.
     *
     * @internal
     * @param {Array<Element>} elements
     * @return {Array<Element>}
     */
    const mergeElements = (elements) => {
      return elements.map((element) => mergeElement(element[idField], element))
    }

    /**
     * Sets an index.
     *
     * @internal
     * @param {String} key
     * @param {Object} index
     */
    const setIndex = (key, index) => {
      if (!index[indexDataField]) {
        throw new Error(`Index must have a '${indexDataField}' field`)
      } else if (typeof index[indexDataField].map !== 'function') {
        throw new Error(`Index '${indexDataField}' field must be an array`)
      }

      index[indexDataField] = mergeElements(index[indexDataField]).map(toValue)

      indexes[key][indexDataField] = index[indexDataField]
    }

    // =========================================================================
    // = High Level
    // =========================================================================

    /**
     * @param {ref<Id>|Id} idRef
     * @return {computed}  computed reference to elements[id]
     */
    const show = (idRef) => {
      return computed(() => {
        const id = toValue(idRef)
        if (showRequiresKey && (id === undefined || id === null)) {
          return
        }

        if (!(id in elementState) || elementState[id] === INVALID) {
          elements[id] = elements[id] || undefined
          elementState[id] = LOADING
          api.get({ [idField]: id }).then((element) => {
            const newElement = mergeElement(id, element)
            elementState[id] = VALID
            return newElement
          })
        }

        return elements[id]
      })
    }

    /**
     * @param {ref<Id>|Id} elementOrIdRef
     * @return Promise
     */
    const invalidate = (elementOrIdRef) => {
      let elementOrId = toValue(elementOrIdRef)
      if (typeof elementOrId === 'object' && idField in elementOrId) {
        elementOrId = elementOrId[idField]
      }

      elementState[elementOrId] = INVALID

      return Promise.resolve()
    }

    /**
     * Given params paramsRef, returns a reactive reference to the index that will asyncronously
     * update to reference the index after the data is fetched from the API.
     *
     * @param {ref|Object} paramsRef
     * @return {Index}
     */
    const getIndex = (paramsRef = {}) => {
      const params = nestedToValue(paramsRef)
      const key = api.key(params)

      if (!(key in indexState) || indexState[key] === INVALID) {
        indexes[key] = indexes[key] || reactive({})
        indexState[key] = LOADING
        api.index({}, params).then(index => {
          setIndex(key, index)
          indexState[key] = VALID
        })
      }

      return indexes[key]
    }

    /**
     * Returns a ref to the index itself that is not suitable for destructuring.
     *
     * @param {ref|Object} paramsRef
     * @return {ref<reactive>}  computed reference to elements[id]
     */
    const indexAsRef = (paramsRef = {}) => {
      return computed(() => getIndex(paramsRef))
    }

    /**
     * @param {ref|Object} paramsRef
     * @return Promise
     */
    const invalidateIndex = (paramsRef = {}) => {
      const params = nestedToValue(paramsRef)
      const key = api.key(params)

      indexState[key] = INVALID

      return Promise.resolve()
    }

    /**
     * @return Promise
     */
    const invalidateAllIndexes = () => {
      for (const key in indexState) {
        indexState[key] = INVALID
      }

      return Promise.resolve()
    }

    /**
     * Returns an object of computed references for destructuring. They are computed references
     * to make the properties depend upon paramsRef.
     *
     * @param {ref|Object} paramsRef
     * @return Proxy
     */
    const index = (paramsRef = {}) => {
      return new Proxy(
        {},
        {
          get (_, prop) {
            return computed(() => {
              const index = getIndex(paramsRef)
              return index[prop]
            })
          }
        }
      )
    }

    /**
     * @param {Element} element
     * @param {Object} params
     * @return {Promise<Element>}
     */
    const store = async (element, params = {}) => {
      const newElement = await api.post(nestedToValue(element), params)
      invalidateAllIndexes()
      return mergeElement(newElement[idField], newElement)
    }

    /**
     * @param {Element} element
     * @param {Object} params
     * @return {Promise<Element>}
     */
    const update = async (element, params = {}) => {
      const updatedElement = await api.put(nestedToValue(element), params)
      const id =
        idField in updatedElement ? updatedElement[idField] : element[idField]
      invalidateAllIndexes()
      return mergeElement(id, updatedElement)
    }

    /**
     * @param {Element} element
     * @param {Object} params
     * @return {Promise<Element>}
     */
    const destroy = async (element, params = {}) => {
      await api.destroy(nestedToValue(element), params)
      invalidateAllIndexes()
      return deleteElement(element)
    }

    /**
     * @param {String} action
     * @param {Object}  options
     * @param {String}  options.apiAction
     * @param {Boolean} options.invalidateIndexes
     * @param {Boolean} options.mergeElements
     * @param {String}  options.url
     */
    const defineAction = async (
      action,
      {
        apiAction = action,
        invalidateIndexes = false,
        mergeElements = true,
        url = undefined
      } = {}
    ) => {
      actions[action] = async (element, params = {}) => {
        const updatedElement = await api[apiAction](
          nestedToValue(element),
          params,
          url ? { url } : undefined
        )
        if (invalidateIndexes) {
          invalidateAllIndexes()
        }
        const id =
          idField in updatedElement
            ? updatedElement[idField]
            : element[idField]
        if (mergeElements && id) {
          return mergeElement(id, updatedElement)
        } else {
          return updatedElement
        }
      }
    }

    Object.entries(apiActions).forEach(([action, options]) =>
      defineAction(action, options)
    )

    return {
      /**
       * These are primarilary included so that pinia dev tools work; without
       * these being returned, these reactive objects will not show in the dev
       * tools.
       */
      elements,
      elementState,
      indexes,
      indexState,
      actions,

      destroy,
      index,
      indexAsRef,
      invalidate,
      invalidateIndex,
      invalidateAllIndexes,
      show,
      store,
      update,

      ...actions
    }
  })
}

defineApiStore.config = {
  idField: 'id',
  indexDataField: 'data',
  showRequiresKey: true,
  ApiOptions: undefined
}

/**
  * @typedef {import('pinia').StoreDefinition} StoreDefinition
  * @param {(store: StoreDefinition) => any} plugin
  */
defineApiStore.use = (plugin) => plugin(defineApiStore)

export default defineApiStore
