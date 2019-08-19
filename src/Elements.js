export default class {
  data = () => ({
    loading: true,
    module: null,
    url: null,
    internalParams: {},
  });

  props = {
    params: {
      type: Object,
      default: () => ({}),
    },
  }

  render = function() {
    return this.$scopedSlots.default(this.slotParams);
  }

  computed = {
    elements() {
      if (this.url) {
        return this.$store.getters[`${this.module}/elements`](this.url);
      }
    },
    meta() {
      if (this.url) {
        return this.$store.getters[`${this.module}/meta`](this.url);
      }
    },

    slotParams() {
      return {
        elements: this.elements,
        firstPage: this.firstPage,
        lastPage: this.lastPage,
        loading: this.loading,
        meta: this.meta,
        query: this.query,
      };
    }
  }

  watch = {
    params: {
      deep: true,
      handler(newVal) {
        this.$set(this, 'internalParams', newVal);
      },
    },

    internalParams: {
      deep: true,
      handler(newVal, oldVal) {
        console.log('testing',
          Object.keys(newVal),
          Object.keys(oldVal)
        );
        console.log('watch internalParams', deepEqual(newVal, oldVal));
        if (!deepEqual(excludeKeys(newVal, 'page'), excludeKeys(oldVal, 'page'))) {
          this.$set(this.internalParams, 'page', 1);
          this.query(newVal);
        }
      },
    },
  }

  methods = {
    addParams(params) {
      for (let key in params) {
        this.$set(this.internalParams, key, params[key]);
      }

      if (!('page' in params)) {
        this.$set(this.internalParams, 'page', 1);
      }

      return this;
    },

    setParams(params) {
      this.internalParams = params;
      return this;
    },

    query(params, mustGet = false) {
      this.loading = true;

      params = {...this.internalParams};

      if (params.page === 1) {
        delete params.page;
      }

      const action = this.module + '/' + (mustGet ? 'mustIndex' : 'index');
      return this.$store.dispatch(action, params)
        .then(response => {
          this.loading = false;
          this.url = response.config.url;
        });
    },
  };

  constructor(module)
  {
    this.mounted = function() {
      this.module = module;
      this.query();
    };
  }
}
