export default class {
  constructor(paramsProperty = 'params') {
    this.paramsProperty = paramsProperty;
  }

  methods = {
    next() {
      let params = this[this.$options.paramsProperty];
      this.gotoPage((params.page || 1) + 1);
    },
    previous() {
      let params = this[this.$options.paramsProperty];
      this.gotoPage((params.page || 1) - 1);
    },

    gotoPage(n) {
      this.$set(this[this.$options.paramsProperty], 'page', n);
    },
  }
}
