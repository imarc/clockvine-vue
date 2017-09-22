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
        let mod = this;

        this.indexUrl = () => indexUrl;

        this.getUrl = (action, params) => {
            let url = this.indexUrl(action, params);
            for (let key in params) {
                url = url.replace(`{${key}}`, params[key]);
            }
            if (action == 'show' || action == 'update' || action == 'destroy') {
                url += '/' + (params.record ? params.record[primaryKey] : params[primaryKey]);
            }

            return url;
        };

        /**
         * This property tells Vuex that this module should be namespaced.
         */
        this.namespaced = true;

        this.state = {
            indexes: {},
            records: {},
        };

        this.getters = {
            indexLoaded: state => url => {
                return typeof(state.indexes[url]) == 'object';
            },

            alphabeticalBy: state => field => {
                return Object.keys(state.records)
                    .map(key => state.records[key])
                    .sort((a, b) => a[field].localeCompare(b[field]));
            },
        };

        this.mutations = {
            api_error(state, error) {
                console.error('api_error', state, error);
            },

            setIndex(state, {url, data}) {
                if (typeof(url) == 'object') {
                }
                Vue.set(state.indexes, url, data);
            },

            setAll(state, response) {
                state.records = {};
                for (let i = 0; i < response.data.length; i++) {
                    if (response.data[i] != null) {
                        Vue.set(
                            state.records,
                            response.data[i][primaryKey],
                            response.data[i]
                        );
                    }
                }
            },

            set(state, response) {
                if (typeof(response.data[primaryKey]) != undefined) {
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

        let reindex = (url, commit, resolve, reject) => {
            Axios.get(url)
                .then(response => {
                    commit('setAll', response.data);
                    commit('setIndex', {url, data: response.data.data});
                    resolve(response);
                })
                .catch(error => {
                    commit('api_error', error)
                    reject(error);
                });
        };

        this.actions = {
            index({commit, getters}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = mod.getUrl('index', params);

                    if (getters.indexLoaded(url)) {
                        resolve();
                    } else {
                        reindex(url, commit, resolve, reject);
                    }
                });
            },

            reindex({commit, getters}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let flattened = Object.assign({}, params, params.record, params.data);
                    let url = mod.getUrl('index', flattened);

                    reindex(url, commit, resolve, reject);
                });
            },

            show({commit, state}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    if (params[primaryKey] in state.records) {
                        resolve();
                    } else {
                        let url = mod.getUrl('show', params);

                        Axios.get(url)
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
                    let url = mod.getUrl('store', params);

                    Axios.post(url, params.data)
                        .then(response => {
                            commit('set', response.data);
                            dispatch('reindex', response.data);
                            resolve(response);
                        })
                        .catch(error => {
                            commit('api_error', error);
                            reject(error);
                        });
                });
            },

            update({commit, dispatch}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = mod.getUrl('update', params);
                    Axios.put(url, params.data)
                        .then(response => {
                            commit('set', response.data);
                            dispatch('reindex', response.data);
                            resolve(response);
                        })
                        .catch(error => {
                            commit('api_error', error);
                            reject(error);
                        });
                });
            },

            destroy({commit, dispatch}, params) {
                return apiQueue.pushTask((resolve, reject) => {
                    let url = mod.getUrl('destroy', params);

                    Axios.delete(url)
                        .then(response => {
                            commit('delete', response.data);
                            dispatch('reindex', response.data);
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
