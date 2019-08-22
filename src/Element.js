export default class {
  constructor(vuexModule, idProperty = 'id')
  {
    this.vuexModule = vuexModule;
    this.idProperty = idProperty;

    this.props = {
      [idProperty]: {required: true},
    };

    this.mounted = function() {
      this.show();
    };

    this.watch = {
      [idProperty](newVal, oldVal) {
        if (newVal !== oldVal) {
          this.show();
        }
      }
    };
  }

  computed = {
    element() {
      if (this[this.$options.idProperty]) {
        return this.$store.getters[`${this.$options.vuexModule}/element`](this[this.$options.idProperty]);
      }
    },

    slotParams() {
      return {
        element: this.element,
      };
    },
  }

  methods = {
    show({mustGet = false } = {}) {
      this.isLoading = true;

      const action = this.$options.vuexModule + '/' + (mustGet ? 'mustShow' : 'show');
      return this.$store.dispatch(action, {[this.$options.idProperty]: this[this.$options.idProperty]})
        .then(response => {
          this.isLoading = false;
          this.url = response.config.url;
        });
    }
  };

  render = function() {
    if (this.element) {
      return this.$scopedSlots.default(this.slotParams);
    } else {
      return '';
    }
  };
}
