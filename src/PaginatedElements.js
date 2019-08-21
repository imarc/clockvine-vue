import Elements from './Elements';

export default class {
  computed = {
    page() {
      if (this.params && this.params.page) {
        return this.params.page;
      } else {
        return 1;
      }
    },

    onFirstPage() {
      return this.page === 1;
    },

    onLastPage() {
      if (this.meta) {
        return this.meta.pagination.total_pages <= this.page;
      }
    },

    slotParams() {
      let parentParams = this.$options.mixins[0].computed.slotParams.call(this);
      return {
        ...parentParams,
        onFirstPage: this.onFirstPage,
        onLastPage: this.onLastPage,
        page: this.page,
      };
    },
  }

  constructor(vuexModule) {
    this.mixins = [new Elements(vuexModule)];
  }
}
