import Elements from './Elements';

export default class {
  data = () => ({
    urls: [],
  });
  computed = {
    page() {
      if (this.internalParams && this.internalParams.page) {
        return this.internalParams.page;
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
      };
    },
  };

  methods = {
    query({mustGet = false} = {}) {
      let parentQuery = this.$options.mixins[0].methods.query;

      return parentQuery.call(this, {mustGet})
        .then(response => {
          console.log('TODO', response);
          this.urls.push(response.config.url);
        });
    },
  };

  constructor(module) {
    this.mixins = [new Elements(module)];
  }
}
