import Vue from 'vue';
import HttpQueue from '../HttpQueue';

/**
 * Base Vuex Module for that communicates with a JSON-based, REST API endpoint.
 */
export default class {

    /**
     * Constructor.
     *
     * @param {string|function} baseUrl - String or function for the baseURL
     * @param {string} idProperty      - Property to use for IDs; default "id"
     * @param {string} pageParameter   - Property to use for pages; default "page"
     * @param {object} pqueueOptions   - Override PQueue options; default {concurrency: 2}
     * @param {string} actionParameter - Property that indicates action: default "action"
     */
    constructor(
        baseUrl,
        {
            idProperty = "id",
            pageParameter = "page",
            pqueueOptions = {concurrency: 2},
            actionParameter = "action",
        } = {},
    ) {
        this.#actionParameter = actionParameter;
        this.#baseUrl = baseUrl;
        this.#httpQueue = new HttpQueue({pqueueOptions});
        this.#idProperty = idProperty;
        this.#pageParameter = pageParameter;
    }

    /**
     * Internal use. Builds a quey string from an object of params.
     *
     * @param {object} params - The object to parameters
     * @return {string}
     */
    #createQueryParams(params) {
        let urlParams = new URLSearchParams;
        for (let [key, val] of Object.entries(params)) {
            if (val != undefined && val !== null && val !== '' && key !== this.#actionParameter) {
                urlParams.append(key, val);
            }
        }

        const urlStr = urlParams.toString();
        if (urlStr.length) {
            return '?' + urlStr;
        } else {
            return '';
        }
    }

    /**
     * Internal use. Builds the URL for the API endpoint. It will use the
     * 'baseURL' callback if it's passed in.
     *
     * @param {object} params - The object of parameters
     * @return {string}
     */
    #createQueryUrl(params) {
        const action = params[this.#actionParameter];
        let url = this.#baseUrl;
        if (typeof url === "function") {
            url = url(params);
        }

        if (action === 'show' || action === 'index') {
            return url + this.#createQueryParams(params);
        } else {
            return url;
        }
    }

    /**
     * Internal use. Removes all instances of element from an array.
     *
     * @param {array} array - Array to modify.
     * @param {mixed} element - element to look for and remove
     * @return {array}
     */
    #spliceAll(array, element) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i] === element) {
                array.splice(i, 1);
            }
        }

        return array;
    }

    /**
     * Internal use. retrieves a nested property from obj, using each element
     * within path as a key, but will always return null instead of throwing any
     * errors.
     *
     * @param {object} obj - Object to descending into
     * @param {array} path - Array of keys
     * @return {mixed}
     */
    #safelyGet(obj, path) {
        return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), obj);
    }

    /**
     * Parameter that the module will set to the action being taken. Valid values it may pass are
     * index, show, store, update, and destroy.
     */
    #actionParameter;

    /**
     * baseUrl for this endpoint, set by the constructor. If it's a string, query
     * params are just appended to this URL. If it's a function, it will be
     * passed the params object and expected to return a string.
     */
    #baseUrl;

    /**
     * The HttpQueue instance.
     */
    #httpQueue;

    /**
     * Parameter used for identifying models. Default is "id".
     */
    #idProperty;

    /**
     * Parameter used for specifying pages. Default is "page".
     */
    #pageParameter;

    /**
     * Flag that this Vuex Module should be namespaced.
     */
    namespaced = true;

    state = {
        /**
         * Indexes stores URLs that reference index requests with arrays inside of
         * them that reference the individual element objects.
         */
        indexes: {},

        /**
         * Elements stores references to the elements themselves, keyed by their
         * idProperty.
         */
        elements: {},
    };


    getters = {
        /**
         * Elements is a getter than returns a function to get an array of elements
         * for a URL.
         */
        elements: state => url => this.#safelyGet(state.indexes, [url, 'data']),

        /**
         * Meta is a getter that returns a function to get meta information for a
         * URL.
         */
        meta: state => url => this.#safelyGet(state.indexes, [url, 'meta']),

        /**
         * Element is a getter that returns a function get a single element by its
         * idProperty.
         */
        element: state => id => state.elements[id],
    };


    mutations = {
        /**
         * setIndex sets an index within the module's store.
         */
        setIndex: (state, {url, data}) => {
            state.indexes = { ...state.indexes, [url]: data };
        },

        /**
         * setElement sets one or more elements within the store. If data is an
         * array, it will act as if setElement was called for each element within
         * the array.
         *
         * @param {object|array} data - element(s) to add to the module's store.
         */
        setElement: (state, {data = []}) => {
            const elements = Array.isArray(data) ? data : [data];

            elements.forEach(element => {
                if (element[this.#idProperty] != undefined) {
                    Vue.set(
                        state.elements,
                        element[this.#idProperty],
                        element
                    );
                }
            });
        },

        /**
         * deleteElement removes one or more elements from the store. If data is an
         * array, it will act as if deleteElement was called for each object within
         * the array.
         *
         * @param {object|array} data - element(s)to remove from the module's store.
         */
        deleteElement: (state, {data = []}) => {
            const elements = Array.isArray(data) ? data : [data];

            elements.forEach(element => {
                if (element[this.#idProperty] != undefined) {
                    Vue.delete(
                        state.elements,
                        element[this.#idProperty]
                    );

                    for (let index of Object.values(state.indexes)) {
                        this.#spliceAll(index.data, element);
                    }
                }
            });
        },
    };


    actions = {
        decorate: ({dispatch}, obj = []) => {
            const elements = Array.isArray(obj) ? obj : [obj];
            elements.forEach(element => {

                if (typeof element === 'function') {
                    element = element();
                }

                const methods = ['show', 'mustShow', 'update', 'store', 'destroy'];

                for (const method of methods) {
                    if (!element.hasOwnProperty('$' + method)) {
                        Object.defineProperty(element, '$' + method, {
                            enumerable: false,
                            value: () => dispatch(method, element),
                        });
                    }
                }
            });

            return obj;
        },

        decorateIndex: ({dispatch}, index = []) => {
            const methods = ['index', 'mustIndex', 'show', 'mustShow', 'update', 'store', 'destroy'];

            for (const method of methods) {
                if (!index.hasOwnProperty('$' + method)) {
                    Object.defineProperty(index, '$' + method, {
                        enumerable: false,
                        value: (...params) => dispatch(method, params),
                    });
                }
            }

            return index;
        },

        /**
         * Gets an index of elements. If previously fetched, uses the cached value.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        index: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params});

            return this.#httpQueue
                .get(url)
                .then(response => {
                    dispatch('decorate', response.data.data);
                    dispatch('decorateIndex', response.data.data);
                    commit("setIndex", {url, data: response.data});
                    commit("setElement", response.data);
                    return response;
                });
        },

        /**
         * Gets an index of elements. Always bypasses the cache.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        mustIndex: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params});

            return this.#httpQueue
                .mustGet(url)
                .then(response => {
                    dispatch("decorate", response.data.data);
                    dispatch('decorateIndex', response.data.data);
                    commit("setIndex", {url, data: response.data});
                    commit("setElement", response.data);
                    return response;
                });
        },

        refreshIndexes: ({state, commit, dispatch}, params = {}) => {
            for (const url in state.indexes) {
                this.#httpQueue
                    .mustGet(url)
                    .then(response => {
                        dispatch("decorate", response.data.data)
                        dispatch('decorateIndex', response.data.data);
                        commit("setIndex", {url, data: response.data});
                        commit("setElement", response.data);
                        return response;
                    });
            }
        },

        /**
         * Gets a single element. If previously fetched, uses the cached value.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        show: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params});

            return this.#httpQueue
                .get(url)
                .then(response => {
                    dispatch("decorate", response);
                    commit("setElement", response);
                    return response;
                });
        },

        /**
         * Gets a single element. Always bypasses the cache.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        mustShow: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params});

            return this.#httpQueue
                .mustGet(url)
                .then(response => {
                    dispatch("decorate", response);
                    commit("setElement", response.data);
                    return response;
                });
        },

        /**
         * Stores a new element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        store: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'store', ...params});

            return this.#httpQueue
                .post(url, params)
                .then(response => {
                    dispatch("decorate", response);
                    commit("setElement", response.data);
                    dispatch("refreshIndexes");
                    return response;
                });
        },

        /**
         * Updates an existing element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        update: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'update', ...params});

            let foo = this.#httpQueue
                .put(url, params)
                .then(response => {
                    dispatch("decorate", response);
                    commit("setElement", response.data);
                    return response;
                });

            return foo;
        },

        /**
         * Destroys (deletes) an existing element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        destroy: ({commit, dispatch}, params = {}) => {
            const url = this.#createQueryUrl({[this.#actionParameter]: 'destroy', ...params});

            return this.#httpQueue
                .delete(url, params)
                .then(response => {
                    commit("deleteElement", response.data);
                    dispatch("refreshIndexes");
                    return response;
                });
        },
    };
}
