import Axios from 'axios';
import Queue from 'simple-promise-queue';
import Vue from 'vue';

/**
 * This is a base class for creating vuex modules that interact with Laravel's
 * RESTful API.
 */
export default class {

    /**
     * The constructor here requires the base URL (relative) for API queries.
     */
    constructor(indexUrl, primaryKey='id') {

        /**
         * This apiQueue uses simple-promise-queue to handle simple queuing
         * around API requests to avoid repeating.
         */
        let apiQueue = new Queue({autoStart: true, concurrency: 1});

        let buildUrl = (str, params) => {
            for (let key in params) {
                str = str.replace(`{${key}}`, params[key]);
            }

            return str;
        };

        /**
         * This property tells Vuex that this module should be namespaced.
         */
        this.namespaced = true;

        this.state = {
            recordsUrl: null,
            records: {},

            current_page: null,
            from: null,
            last_page: null,
            next_page_url: null,
            path: null,
            per_page: null,
            prev_page_url: null,
            to: null,
            total: null,
        };

        this.getters = {

            loaded(state) {
                return Object.keys(state.records).length > 0;
            },

            alphabeticalBy: state => field => {
                return Object.keys(state.records)
                    .map(key => state.records[key])
                    .sort((a, b) => a[field].localeCompare(b[field]));
            },

            nextPage: state => state.next_page_url,

            prevPage: state => state.prev_page_url,

            pageSummary: state => `Showing ${state.from}–${state.to} of ${state.total} result${state.total == 1 ? '' : 's'}.`,

        };

        this.mutations = {
            api_error(state, error) {
                //
            },

            setAll(state, {url, response}) {
                state.recordsUrl = url;
                state.records = {};
                for (let i = 0; i < response.data.length; i++) {
                    Vue.set(
                        state.records,
                        response.data[i][primaryKey],
                        response.data[i]
                    );
                }

                let paginationParams = [
                    'current_page', 'from', 'last_page', 'next_page_url',
                    'path', 'per_page', 'prev_page_url', 'to', 'total',
                ];

                for (let param of paginationParams) {
                    if (param in response) {
                        Vue.set(state, param, response[param]);
                    } else if (param in state) {
                        Vue.set(state, param, null);
                    }
                }
            },

            set(state, response) {
                if (typeof(response.data[primaryKey]) != undefined) {

                    /**
                     * This is a HACK. For whatever reason, Vue.set alone
                     * doesn't seem to trigger getters to update, whereas doing
                     * this does.
                     */
                    Vue.delete(state.records, response.data[primaryKey]);
                    Vue.set(
                        state.records,
                        response.data[primaryKey],
                        response.data
                    );
                }
            },

            delete(state, response) {
                if (typeof(response.data[primaryKey]) != undefined) {
                    Vue.delete(
                        state.records,
                        response.data[primaryKey]
                    );
                }
            },
        };

        this.actions = {
            index({commit, getters, state}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = indexUrl;
                    if (params && typeof(params.urlParams) != 'undefined') {
                        url = buildUrl(url, params.urlParams);

                    } else if (params && 'url' in params) {
                        url = params.url;
                    }

                    if (url == state.recordsUrl && getters.loaded) {
                        resolve();
                    } else {
                        Axios.get(url)
                            .then(response => {
                                commit('setAll', {url, response: response.data});
                                resolve(response);
                            })
                            .catch(error => {
                                commit('api_error', error)
                                reject(error);
                            });
                    }
                });
            },

            show({commit, state}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    if (params[primaryKey] in state.records) {
                        resolve();
                    } else {
                        let url = indexUrl;
                        if (params && typeof(params.urlParams) != 'undefined') {
                            url = buildUrl(url, params.urlParams);
                        }
                        Axios.get(`${url}/${params[primaryKey]}`)
                            .then(response => {
                                commit('set', response.data);
                                resolve(response);
                            })
                            .catch(error => {
                                commit('api_error', error);
                                reject(error);
                            });
                    }
                });
            },

            store({commit, dispatch}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = indexUrl;
                    if (params && typeof(params.urlParams) != 'undefined') {
                        url = buildUrl(url, params.urlParams);
                    }
                    Axios.post(url, params.data)
                        .then(response => {
                            commit('set', response.data);
                            dispatch('index', params);
                            resolve(response);
                        })
                        .catch(error => {
                            commit('api_error', error);
                            reject(error);
                        });
                });
            },

            update({commit}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = indexUrl;
                    if (params && typeof(params.urlParams) != 'undefined') {
                        url = buildUrl(url, params.urlParams);
                    }
                    Axios.put(`${url}/${params.record[primaryKey]}`, params.data)
                        .then(response => {
                            commit('set', response.data);
                            resolve(response);
                        })
                        .catch(error => {
                            commit('api_error', error);
                            reject(error);
                        });
                });
            },

            destroy({commit}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = indexUrl;
                    if (params && typeof(params.urlParams) != 'undefined') {
                        url = buildUrl(url, params.urlParams);
                    }
                    Axios.delete(`${url}/${params[primaryKey]}`)
                        .then(response => {
                            commit('delete', response.data);
                            resolve(response);
                        })
                        .catch(error => {
                            commit('api_error', error)
                            reject(error);
                        });
                });
            },
        };
    }
};
