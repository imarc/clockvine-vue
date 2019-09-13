export default {

    props: {
        vuexModule: {
            type: String,
            required: true,
        },

        id: {},

        noFetching: {
            type: Boolean,
            default: false,
        },

        newElement: {
            type: Object,
        },
    },

    data: () => ({
        internalElement: null,
    }),

    created() {
        if (!this.id && this.newElement) {
            if (typeof this.newElement === 'function') {
                this.internalElement = this.newElement();
            } else {
                this.internalElement = {...this.newElement};
            }
        }
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
            if (this.id) {
                return this.$store.getters[`${this.vuexModule}/element`](this.id);
            } else if (this.internalElement) {
                return this.internalElement;
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
                refresh() {
                    this.show({mustGet: true});
                },
                store: this.store,
                update: this.update,
                destroy: this.destroy
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

            const action = `${this.vuexModule}/${mustGet ? 'mustShow' : 'show'}`;
            return this.$store.dispatch(action, {id: this.id})
                .then(response => {
                    this.isLoading = false;
                    this.url = response.config.url;
                });
        },

        store() {
            this.isLoading = true;
            const action = `${this.vuexModule}/store`;
            return this.$store.dispatch(action, this.element)
                .then(response => {
                    this.isLoading = false;
                });
        },

        update() {
            this.isLoading = true;
            const action = `${this.vuexModule}/update`;
            return this.$store.dispatch(action, this.element)
                .then(response => {
                    this.isLoading = false;
                });
        },

        destroy() {
            this.isLoading = true;
            const action = `${this.vuexModule}/destroy`;
            return this.$store.dispatch(action, this.element)
                .then(response => {
                    this.isLoading = false;
                });
        },
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
