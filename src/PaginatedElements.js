import Elements from './Elements';

export default class {
  computed = {
    page() {
      if (this.flattenedParams && this.flattenedParams.page) {
        return this.flattenedParams.page;
      } else {
        return 1;
      }
    },

    firstPage() {
      return this.page === 1;
    },

    lastPage() {
      if (this.meta) {
        return this.meta.pagination.total_pages <= this.page;
      }
    },

    slotParams() {
      let parentParams = this.$options.mixins[0].computed.slotParams.call(this);
      return {
        ...parentParams,
        next: this.next,
        previous: this.previous,
      };
    },
  }

  methods = {
    skipTo(page) {
      return this.addParams({page}).query();
    },

    next() {
      if (!this.lastPage) {
        return this.skipTo(this.page + 1);
      }
    },

    previous() {
      if (!this.firstPage) {
        return this.skipTo(this.page - 1);
      }
    },
  }

  constructor(module) {
    this.mixins = [new Elements(module)];
  }
}
