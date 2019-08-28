import Vue from 'vue';
import HttpQueue from './HttpQueue';

export default class {
  /**
   *
   */
  #createQueryParams(params) {
    let urlParams = new URLSearchParams;
    for (let [key, val] of Object.entries(params)) {
      if (val != undefined && val !== null && val !== '') {
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
   *
   */
  #createQueryUrl(params) {
    let url = this.#baseUrl;
    if (typeof url === "function") {
      url = url(params);
    }

    return url + this.#createQueryParams(params);
  }

  #spliceAll(array, element) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i] == element) {
        array.splice(i, 1);
      }
    }

    return array;
  }

  #safelyGet(obj, path) {
    return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), obj);
  }

  /**
   *
   */
  #actionParameter;
  #baseUrl;
  #httpQueue;
  #idProperty;
  #pageParameter;

  /**
   *
   */
  namespaced = true;

  /**
   *
   */
  state = {
    indexes: {},
    elements: {},
  };

  getters = {
    elements: state => url => this.#safelyGet(state.indexes, [url, 'data']),
    meta: state => url => this.#safelyGet(state.indexes, [url, 'meta']),

    element: state => id => state.elements[id],
  };

  /**
   *
   */
  mutations = {
    setIndex: (state, {url, data}) => {
      Vue.set(state.indexes, url, data);
    },

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

    deleteElement: (state, {data = []}) => {
      if (Array.isArray(data)) {
        const elements = data;
      } else {
        const elements = [data];
      }
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

  /**
   *
   */
  actions = {

    index: ({commit, getters}, params = {}) => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params});

      return this.#httpQueue
        .get(url)
        .then(response => {
          commit("setIndex", {url, data: response.data});
          commit("setElement", response.data);
          return response;
        });
    },

    mustIndex: ({commit, getters}, params = {}) => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'index', ...params});

      return this.#httpQueue
        .mustGet(url)
        .then(response => {
          commit("setIndex", {url, data: response.data});
          commit("setElement", response.data);
          return response;
        });
    },

    show: ({commit}, params = {}) => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params});

      return this.#httpQueue
        .get(url)
        .then(response => {
          commit("setElement", response);
          return response;
        });
    },

    mustShow: ({commit}, params = {}) => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'show', ...params});

      return this.#httpQueue
        .mustGet(url)
        .then(response => {
          commit("setElement", response.data);
          return response;
        });
    },

    store: ({commit, dispatch}, params = {}) => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'store', ...params});

      return this.#httpQueue
        .post(url, params)
        .then(response => {
          commit("setElement", response.data);
          return response;
        });
    },
    update: () => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'update', ...params});

      return this.#httpQueue
        .put(url, params)
        .then(response => {
          commit("setElement", response.data);
          return response;
        });
    },
    destroy: () => {
      const url = this.#createQueryUrl({[this.#actionParameter]: 'destroy', ...params});

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
}
