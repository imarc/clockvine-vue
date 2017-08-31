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
    constructor(indexUrl) {

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
            records: {},
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
        };

        this.mutations = {
            api_error(state, error) {
                //
            },

            setAll(state, response) {
                state.records = {};
                for (let i = 0; i < response.data.length; i++) {
                    Vue.set(
                        state.records,
                        response.data[i].id,
                        response.data[i]
                    );
                }
            },

            set(state, response) {
                if (typeof(response.data.id) != undefined) {
                    Vue.set(
                        state.records,
                        response.data.id,
                        response.data
                    );
                }
            },

            delete(state, response) {
                if (typeof(response.data.id) != undefined) {
                    Vue.delete(
                        state.records,
                        response.data.id
                    );
                }
            },
        };

        this.actions = {
            index({commit, getters}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    if (getters.loaded) {
                        resolve();
                    } else {
                        let url = indexUrl;
                        if (params && typeof(params.urlParams) != 'undefined') {
                            url = buildUrl(url, params.urlParams);
                        }
                        Axios.get(url)
                            .then(response => {
                                commit('setAll', response.data);
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
                    if (params.id in state.records) {
                        resolve();
                    } else {
                        let url = indexUrl;
                        if (params && typeof(params.urlParams) != 'undefined') {
                            url = buildUrl(url, params.urlParams);
                        }
                        Axios.get(`${url}/${params.id}`)
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
                    Axios.put(`${url}/${params.data.id}`, params.data)
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
                    Axios.delete(`${url}/${params.id}`)
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
