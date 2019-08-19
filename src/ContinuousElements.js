import { deepEqual } from 'fast-equals';
import Elements from './Elements';

export default class {
  data = () => ({
    urls: [],
  });
  computed = {
    page() {
      if (this.flattenedParams && this.flattenedParams.page) {
        return this.flattenedParams.page;
      } else {
        return 1;
      }
    },
    elements() {
      if (this.urls.length) {
        return [].concat(...this.urls.map(
          url => this.$store.getters[`${this.module}/elements`](url)
        ));
      }
    },

    meta() {
      if (this.urls.length) {
        const lastUrl = this.urls[this.urls.length - 1];
        return this.$store.getters[`${this.module}/meta`](lastUrl);
      }
    },

    hasMore() {
      if (this.meta) {
        return this.meta.pagination.total_pages > this.page;
      }
    },

    slotParams() {
      let parentParams = this.$options.mixins[0].computed.slotParams.call(this);
      return {
        ...parentParams,
        hasMore: this.hasMore,
        fetchMore: this.fetchMore,
      };
    },
  };

  methods = {
    query(params) {
      this.loading = true;

      params = {...this.flattenedParams, ...params};

      if (params.page === 1) {
        delete params.page;
      }

      return this.$store.dispatch(`${this.module}/index`, params)
        .then(response => {
          this.loading = false;
          this.urls.push(response.config.url);
        });
    },

    fetchMore() {
      if (this.hasMore) {
        this.addParams({page: this.page + 1});
      }
    }
  };

  constructor(module) {
    this.mixins = [new Elements(module)];
  }
}
