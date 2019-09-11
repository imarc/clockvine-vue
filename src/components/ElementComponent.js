export default {

    props: {
        vuexModule: {
            type: String,
            required: true,
        },

        id: {
            required: true,
        },

        noFetching: {
            type: Boolean,
            default: false,
        }
    },

    mounted() {
        this.show();
    },

    watch: {
        id(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.show();
            }
        }
    },

    computed: {
        /**
         * Returns the current element from Vuex.
         *
         * @return {object}
         */
        element() {
            if (this[this.$options.idProperty]) {
                return this.$store.getters[`${this.$options.vuexModule}/element`](this[this.$options.idProperty]);
            }
        },

        /**
         * Specifies which params are exposed to the default slot.
         *
         * @return {object}
         */
        slotParams() {
            return {
                element: this.element,
            };
        },
    },

    methods: {
        /**
         * Queries the Vuex module for this element.
         *
         * @param {boolean} mustGet - if true, forces a new HTTP request. Default false
         *
         * @return {promise}
         */
        show({mustGet = false } = {}) {
            if (!mustGet && this.noFetching) {
                return;
            }
            this.isLoading = true;

            const action = `${this.$options.vuexModule  }/${  mustGet ? 'mustShow' : 'show'}`;
            return this.$store.dispatch(action, {[this.$options.idProperty]: this[this.$options.idProperty]})
                .then(response => {
                    this.isLoading = false;
                    this.url = response.config.url;
                });
        }
    },

    /**
     * Render function. This is a renderless component that just uses the default
     * slot for everything.
     */
    render() {
        if (this.element) {
            return this.$scopedSlots.default(this.slotParams);
        }
            return '';

    },
}
