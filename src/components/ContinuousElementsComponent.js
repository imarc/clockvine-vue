import isEqual from 'lodash/isEqual';
import ElementsComponent from './ElementsComponent';

export default class {

  /**
   * Construct a new Vue component associated with the Vuex Module vuexModule. It is similar to Elements, but supports displaying the results from multiple URLs as a single array.
   *
   * @param {string} vuexModule
   */
  constructor(vuexModule) {
    this.mixins = [new ElementsComponent(vuexModule)];
  }


  data = () => ({
    /**
     * Common parameters to all active URLs, to determine whether to empty the urls array.
     */
    commonParams: {},
    /**
     * Array of current URLs.
     */
    urls: [],
  });


  computed = {
    /**
     * Return the current page.
     *
     * @return {number}
     */
    page() {
      if (this.params && this.params.page) {
        return this.params.page;
      } else {
        return 1;
      }
    },

    /**
     * Override the elements property from Elements with one that combines the
     * results from all URLs in the urls property.
     *
     * @return {array}
     */
    elements() {
      if (this.urls.length) {
        return [].concat(...this.urls.map(
          url => this.$store.getters[`${this.vuexModule}/elements`](url)
        ));
      }
    },

    /**
     * Return the meta information for the last URL.
     *
     * @return {object}
     */
    meta() {
      if (this.urls.length) {
        const lastUrl = this.urls[this.urls.length - 1];
        return this.$store.getters[`${this.vuexModule}/meta`](lastUrl);
      }
    },

    /**
     * Return whether there's more elements to fetch.
     *
     * @return {boolean}
     */
    hasMore() {
      if (this.meta) {
        return this.meta.pagination.total_pages > this.page;
      }
    },

    /**
     * Only these properties are exposed to the slot template. First we fetch
     * the 'parentParams' - params that are exposed by Elements - and then add
     * in the ones specific to this class.
     */
    slotParams() {
      let parentParams = this.$options.mixins[0].computed.slotParams.call(this);
      return {
        ...parentParams,
        hasMore: this.hasMore,
      };
    },
  };

  methods = {
    /**
     * Queries the Vuex Module (triggers an index or mustIndex.)
     *
     * @param {boolean} mustGet - if true, forces a new HTTP request. Default false
     *
     * @return {promise}
     */
    query({mustGet = false} = {}) {
      let clonedParams = {...this.filteredParams};
      let clearExisting = false;
      let parentQuery = this.$options.mixins[0].methods.query;

      delete clonedParams.page;

      if (!isEqual(clonedParams, this.commonParams)) {
        clearExisting = true;
        this.commonParams = clonedParams;
      }

      return parentQuery.call(this, {mustGet})
        .then(response => {
          if (clearExisting) {
            this.urls = [response.config.url];
          } else {
            this.urls.push(response.config.url);
          }
        });
    },
  };
}
