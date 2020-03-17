import Vue from 'vue';
import HttpQueue from '../HttpQueue';
import Debounce from 'debounce-promise';
import { populateStr, safelyGet, spliceAll } from '../helpers/functions';

/**
 * Base Vuex Module for that communicates with a JSON-based, REST API endpoint.
 */
export default class {

    /**
     * Constructor.
     *
     * @param {string|function} baseUrl - String or function for the baseURL
     * @param {string} idProperty       - Property to use for IDs; default "id"
     * @param {string} pageParameter    - Property to use for pages; default "page"
     * @param {object} pqueueOptions    - Override PQueue options; default {concurrency: 2}
     * @param {string} actionParameter  - Property that indicates action; default "action"
     * @param {number} debounce         - Set a debounce in between events; default 0
     * @param {object} debounceOptions  - Override Debouce options; default {}
     * @param {object} relatedElements  - configure indexing related (nested) elements; default {}
     */
    constructor(
        baseUrl,
        {
            idProperty = "id",
            pageParameter = "page",
            pqueueOptions = {concurrency: 2},
            actionParameter = "action",
            debounce = 0,
            debounceOptions = {},
            relatedElements = {},
        } = {},
    ) {
        this.#actionParameter = actionParameter;
        this.#baseUrl = baseUrl;
        this.#httpQueue = new HttpQueue({pqueueOptions});
        this.#idProperty = idProperty;
        this.#pageParameter = pageParameter;
        this.#debounce = debounce;
        this.#debounceOptions = debounceOptions;
        this.#relatedElements = relatedElements;

        this.actions.index = Debounce((...args) => this.#index(...args), this.#debounce, this.#debounceOptions);
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
    #createQueryUrl(params, availableParams = {}) {
        const action = params[this.#actionParameter];
        let url = this.#baseUrl;
        if (typeof url === "function") {
            url = url(params, availableParams);
        }

        if (action === 'show' || action === 'index') {
            return url + this.#createQueryParams(params);
        } else {
            return url;
        }
    }

    #parsePayload(payload) {
        if ('params' in payload || 'data' in payload) {
            return payload;
        } else {
            return { params: payload, data: {} };
        }
    }

    /**
     * Gets an index of elements. If previously fetched, uses the cached value.
     *
     * @param {object} params - parameters to pass
     * @return {promise}
     */
    #index({commit, dispatch}, params = {}) {
        const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params});

        return this.#httpQueue
            .get(url)
            .then(response => {
                dispatch('decorate', { params, elements: response.data.data });
                dispatch('decorateIndex', { params, index: response.data });
                commit("setIndex", {url, data: response.data});
                commit("setElement", response.data.data);

                for (let module in this.#relatedElements) {
                    response.data.data.forEach(element => {
                        let { params = { ...params }, elements = [] } = this.#relatedElements[module](element);
                        dispatch(`${module}/decorate`, { params, elements }, { root: true });
                        commit(`${module}/setElement`, elements, { root: true });
                    });
                }

                return response;
            });
    };

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

    #debounce;
    #debounceOptions;

    /**
     * Update debouncing callbacks.
     */
    #debouncedUpdates = {};

    #debouncedStores = [];

    /**
     * Parameter used for identifying models. Default is "id".
     */
    #idProperty;

    /**
     * Used to configure related elements that should be decorated, indexed,
     * and/or updated whenever these elements are.
     */
    #relatedElements;

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
        elements: state => url => safelyGet(state.indexes, [url, 'data']),

        /**
         * Meta is a getter that returns a function to get meta information for a
         * URL.
         */
        meta: state => url => safelyGet(state.indexes, [url, 'meta']),

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

            return state.indexes[url];
        },

        /**
         * setElement sets one or more elements within the store. If data is an
         * array, it will act as if setElement was called for each element within
         * the array.
         *
         * @param {object|array} data - element(s) to add to the module's store.
         */
        setElement: (state, data = []) => {
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

            return elements;
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
                        spliceAll(index.data, element);
                    }
                }
            });

            return elements;
        },
    };


    actions = {
        decorate: ({dispatch, state}, { elements = [], params = {} } = {}) => {
            const ensureArray = Array.isArray(elements) ? elements : [elements];
            ensureArray.forEach(element => {

                if (typeof element === 'function') {
                    element = element();
                }

                if (!element.hasOwnProperty('$params')) {
                    Object.defineProperty(element, '$params', {
                        enumerable: false,
                        get: () => params,
                    });
                }

                if (!element.hasOwnProperty('$exists')) {
                    Object.defineProperty(element, '$exists', {
                        enumerable: false,
                        get: () => element[this.#idProperty] in state.elements,
                    });
                }

                for (const method of ['show', 'mustShow', 'destroy']) {
                    if (!element.hasOwnProperty('$' + method)) {
                        Object.defineProperty(element, '$' + method, {
                            enumerable: false,
                            value: (params = {}) => dispatch(method, {
                                params: {...element.$params, ...params},
                                data: element,
                            }),
                        });
                    }
                }

                for (const method of ['update', 'store']) {
                    if (!element.hasOwnProperty('$' + method)) {
                        Object.defineProperty(element, '$' + method, {
                            enumerable: false,
                            value: (params = {}) => dispatch(method, {
                                params: {...element.$params, ...params},
                                data: element,
                            }),
                        });
                    }
                }
            });

            return elements;
        },

        decorateIndex: ({dispatch}, { params = {}, index = [] }) => {
            if (!index.hasOwnProperty('$params')) {
                Object.defineProperty(index, '$params', {
                    enumerable: false,
                    get: () => params,
                });
            }

            for (const method of ['index', 'mustIndex', 'show', 'mustShow', 'destroy']) {
                if (!index.hasOwnProperty('$' + method)) {
                    Object.defineProperty(index, '$' + method, {
                        enumerable: false,
                        value: (params) => dispatch(method, {
                            params: {...index.$params, ...params},
                            data: index,
                        }),
                    });
                }
            }

            for (const method of ['update', 'store']) {
                if (!index.hasOwnProperty('$' + method)) {
                    Object.defineProperty(index, '$' + method, {
                        enumerable: false,
                        value: ({ params = {}, data = {} } = {}) => dispatch(method, {
                            params: {...index.$params, ...params},
                            data,
                        }),
                    });
                }
            }

            return index;
        },

        /**
         * Gets an index of elements. Always bypasses the cache.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        mustIndex: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params}, data);

            return this.#httpQueue
                .mustGet(url)
                .then(response => {
                    dispatch("decorate", { params, elements: response.data.data });
                    dispatch('decorateIndex', { params, index: response.data });
                    commit("setIndex", {url, data: response.data});
                    commit("setElement", response.data.data);
                    return response;
                });
        },

        refreshIndexes: ({state, commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);

            for (const url in state.indexes) {
                this.#httpQueue
                    .mustGet(url)
                    .then(response => {
                        dispatch('decorateIndex', { index: response.data });

                        let params = state.indexes[url].$params;
                        dispatch("decorate", { params, elements: response.data.data });

                        commit("setIndex", {url, data: response.data});
                        commit("setElement", response.data.data);
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
        show: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params}, data);

            return this.#httpQueue
                .get(url)
                .then(response => {
                    dispatch("decorate", { params, elements: response.data.data });
                    commit("setElement", response.data.data);
                    return response;
                });
        },

        /**
         * Gets a single element. Always bypasses the cache.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        mustShow: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params}, data);

            return this.#httpQueue
                .mustGet(url)
                .then(response => {
                    dispatch("decorate", { params, elements: response.data.data });
                    commit("setElement", response.data.data);
                    return response;
                });
        },

        /**
         * Stores a new element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        store: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            const url = this.#createQueryUrl({[this.#actionParameter]: 'store', ...params}, data);

            let key = this.#debouncedStores.findIndex(({params: obj}) => obj === params);

            if (key === -1) {
                let status = 'Bouncing';
                let backlog = [];
                key += this.#debouncedStores.push({
                    params,
                    status,
                    backlog,
                    promise: Debounce((url, params) => {
                        status = 'Fetching';
                        return this.#httpQueue
                            .post(url, data)
                            .then(response => dispatch("decorate", { params, elements: response.data.data }))
                            .then(element => {
                                status = 'Bouncing';
                                commit('setElement', element);
                                dispatch("refreshIndexes");

                                return element;
                            });
                    }, this.#debounce, this.#debounceOptions)
                });

            } else {
                if (this.#debouncedStores[key].status === 'Fetching') {
                    return this.#debouncedStores[key].promise.then((...args) => {
                        // TOOD review
                        throw new Error('Should not get here', args);
                    });
                }
            }

            return this.#debouncedStores[key].promise(url, params);
        },

        /**
         * Updates an existing element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        update: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            let key = params[this.#idProperty];
            if (key === undefined) {
                key = data[this.#idProperty];
            }
            const url = this.#createQueryUrl(
                {
                    [this.#actionParameter]: 'update',
                    [this.#idProperty]: key,
                    ...params,
                },
                data
            );

            if (!this.#debouncedUpdates[key]) {
                this.#debouncedUpdates[key] = Debounce((url, params) => {
                    return this.#httpQueue
                        .put(url, data)
                        .then(response => {
                            delete this.#debouncedUpdates[key];
                            dispatch("decorate", { params, elements: response.data.data });
                            commit("setElement", response.data.data);
                            return response;
                        });
                }, this.#debounce, this.#debounceOptions);
            }

            return this.#debouncedUpdates[key](url, params);
        },

        /**
         * Destroys (deletes) an existing element.
         *
         * @param {object} params - parameters to pass
         * @return {promise}
         */
        destroy: ({commit, dispatch}, payload = {}) => {
            const {params, data} = this.#parsePayload(payload);
            const url = this.#createQueryUrl({[this.#actionParameter]: 'destroy', ...params}, data);

            return this.#httpQueue
                .delete(url)
                .then(response => {
                    commit("deleteElement", response.data.data);
                    dispatch("refreshIndexes");
                    return response;
                });
        },
    };
}
