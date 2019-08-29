export default class {
    /**
     * Construct a new Vue component associated with a single element in a vuexModule.
     *
     * @param {string} vuexModule
     * @param {string} idProperty  default "id"
     */
    constructor(vuexModule, idProperty = 'id')
    {
        this.vuexModule = vuexModule;
        this.idProperty = idProperty;

        this.props = {
            /**
             * The idProperty is required.
             */
            [idProperty]: {required: true},

            /**
             * This disables making API requests for this element, and instead will
             * only return whatever is already within Vuex.
             */
            noFetching: {type: Boolean, default: false},
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
    };

    computed = {
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
    }

    methods = {
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

            const action = this.$options.vuexModule + '/' + (mustGet ? 'mustShow' : 'show');
            return this.$store.dispatch(action, {[this.$options.idProperty]: this[this.$options.idProperty]})
                .then(response => {
                    this.isLoading = false;
                    this.url = response.config.url;
                });
        }
    };

    /**
     * Render function. This is a renderless component that just uses the default
     * slot for everything.
     */
    render = function() {
        if (this.element) {
            return this.$scopedSlots.default(this.slotParams);
        } else {
            return '';
        }
    };
}
