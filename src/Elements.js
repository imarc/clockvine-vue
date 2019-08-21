import { deepEqual } from 'fast-equals';

export default class {
  data = () => ({
    /**
     * Whether data is loading or not.
     */
    isLoading: true,

    /**
     * The vuex module this component is tied to.
     * TODO - move this to $options
     */
    vuexModule: null,

    /**
     * The current URL for the data being shown for this component.
     * TODO - maybe moev this to $options?
     */
    url: null,
  });

  props = {
    /**
     * Query parameters.
     */
    params: {
      type: Object,
      default: () => ({}),
    },

    /**
     * Query parameters to filter out.
     */
    ignoreParams: {
      type: Object,
      default: () => ({
        page: 1,
      }),
    },
  }

  /**
   *
   */
  render = function() {
    return this.$scopedSlots.default(this.slotParams);
  }

  computed = {
    elements() {
      if (this.url) {
        return this.$store.getters[`${this.vuexModule}/elements`](this.url);
      }
    },

    meta() {
      if (this.url) {
        return this.$store.getters[`${this.vuexModule}/meta`](this.url);
      }
    },

    filteredParams() {
      let params = {...this.params};

      for (let key in this.ignoreParams) {
        if (key in params) {
          if (typeof this.ignoreParams[key] === 'function') {
            if (this.ignoreParams[key](params[key])) {
              delete params[key];
            }
          } else if (this.ignoreParams[key] === params[key]) {
            delete params[key];
          }
        }
      }

      return params;
    },

    slotParams() {
      return {
        elements: this.elements,
        isLoading: this.isLoading,
        meta: this.meta,
        query: this.query,
      };
    }
  }

  watch = {
    params: {
      deep: true,
      handler() {
        this.query();
      },
    },
  }

  methods = {
    query({mustGet = false} = {}) {
      this.isLoading = true;

      const action = this.vuexModule + '/' + (mustGet ? 'mustIndex' : 'index');
      return this.$store.dispatch(action, this.filteredParams)
        .then(response => {
          this.isLoading = false;
          this.url = response.config.url;
        });
    },
  };

  constructor(vuexModule)
  {
    this.mounted = function() {
      this.vuexModule = vuexModule;
      this.query();
    };
  }
}
