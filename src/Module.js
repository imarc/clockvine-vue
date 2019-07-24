import Vue from "vue";
import {stringify} from "qs";
import HttpQueue from './HttpQueue';

export default class {
    /**
     *
     */
    #createQueryParams(params) {
        const str = stringify(params, {
            sort: (a, b) => a.localeCompare(b),
            filter(key, value) {
                return value == null || value === "" ? undefined : value;
            }
        });

        return str.length ? `?${str}` : "";
    }

    /**
     *
     */
    #createQueryUrl(params) {
        let url = baseUrl;
        if (typeof baseUrl === "function") {
            url = baseUrl(params);
        }

        return url + this.#createQueryParams(params);
    }

    /**
     *
     */
    #httpQueue;
    #indexProperty;
    #pageParameter;
    #actionParameter;

    /**
     *
     */
    namespaced = true;

    /**
     *
     */
    state = {
        elements: {},
    };

    /**
     *
     */
    mutations = {
        setIndex(state, {url, data}) {
            Vue.set(state.indexes, url, data);
        },

        setElement(state, {data = []}) {
            if (Array.isArray(data)) {
                const elements = data;
            } else {
                const elements = [data];
            }
            elements.forEach(element => {
                if (element[this.#indexProperty] != undefined) {
                    Vue.set(
                        state.elements,
                        element[this.#indexProperty],
                        element
                    );
                }
            });
        },

        deleteElement(state, {data = []}) {
            if (Array.isArray(data)) {
                const elements = data;
            } else {
                const elements = [data];
            }
            elements.forEach(element => {
                if (element[this.#indexProperty] != undefined) {
                    Vue.delete(
                        state.elements,
                        element[this.#indexProperty]
                    );
                }
            });
        },
    };

    /**
     *
     */
    actions = {
        index({commit, getters}, params = {}) {
            const url = this.#createQueryUrl({[actionParameter]: 'index', ...params});

            return this.#httpQueue
                .get(url)
                .then(response => {
                    commit("setIndex", {url, data: response.data.data});
                    commit("setElement", response.data);
                    return response;
                });
        },

        show({commit}, params = {}) {
            const url = this.#createQueryUrl({[actionParameter]: 'show', ...params});

            return this.#httpQueue
                .get(url)
                .then(response => {
                    commit("set", response.data);
                    return response;
                });
        },

        store({commit, dispatch}, params = {}) {
            const url = this.#createQueryUrl({[actionParameter]: 'store', ...params});

            return this.#httpQueue
                .post(url, params)
                .then(response => {
                    commit("set", response.data);
                    return response;
                });
        },
        update() {
            const url = this.#createQueryUrl({[actionParameter]: 'update', ...params});

            return this.#httpQueue
                .put(url, params)
                .then(response => {
                    commit("setElement", response.data);
                    return response;
                });
        },
        destroy() {
            const url = this.#createQueryUrl({[actionParameter]: 'destroy', ...params});

            return this.#httpQueue
                .delete(url, params)
                .then(response => {
                    commit("deleteElement", response.data);
                    return response;
                });
        },
    };

    /**
     *
     */
    constructor(
        baseUrl,
        {
            indexProperty = "id",
            pageParameter = "page",
            pqueueOptions = {concurrency: 2},
            actionParameter = "action",
        },
    ) {
        this.#httpQueue = new HttpQueue({pqueueOptions});
        this.#indexProperty = indexProperty;
        this.#pageParameter = pageParameter;
        this.#actionParameter = actionParameter;
    }
}
