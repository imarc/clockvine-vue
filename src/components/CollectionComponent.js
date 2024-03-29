import withHelper from '../helpers/with'

export default {

    mounted () {
        this.query()
    },

    data: () => ({
    /**
         * Whether data is loading or not.
         */
        isLoading: true,

        /**
         * The current URL for the data being shown for this component.
         * TODO - maybe moev this to $options?
         */
        url: null,
    }),

    props: {
        vuexModule: {
            type: String,
            required: true,
        },

        /**
         * Query parameters.
         */
        params: {
            type: Object,
            default: () => ({}),
        },

        /**
         * Query parameters to filter out. If the value is anything but a function,
         * it will check that both the key and value match before removing them. If
         * the value is a function, it will pass the current value to that function
         * and use whether the function returns a truthy value to determine whether
         * to remove the value.
         *
         * In general, you'd want this object to represent what your API defaults
         * to, so you avoid passing in unnecessary parameters.
         */
        ignoreParams: {
            type: Object,
            default: () => ({
                page: 1,
                orderBy: 'title asc',
            }),
        },

        requireParams: {
            default: false,
        },
    },

    /**
     * Render function. This is a renderless component that just uses the default
     * slot for everything.
     */
    render () {
        return this.$scopedSlots.default(this.slotParams)
    },

    computed: {

        /**
         * Returns the elements from Vuex for the current URL.
         *
         * @return {array}
         */
        elements () {
            if (this.url) {
                return this.$store.getters[`${this.vuexModule}/elements`](this.url)
            }
        },

        /**
         * Returns the meta from Vuex for the current URL.
         *
         * @return {object}
         */
        meta () {
            if (this.url) {
                return this.$store.getters[`${this.vuexModule}/meta`](this.url)
            }
        },

        /**
         * Returns the filtered parameters before passing them to the module.
         *
         * @return {object}
         */
        filteredParams () {
            const params = { ...this.params }

            Object.entries(this.ignoreParams).forEach(([key, value]) => {
                if (key in params) {
                    if (typeof value === 'function') {
                        if (value(params[key])) {
                            delete params[key]
                        }
                    } else if (value === params[key]) {
                        delete params[key]
                    }
                }
            })

            return params
        },

        /**
         * Only these properties are exposed to the slot/template.
         *
         * @return {object}
         */
        slotParams () {
            return {
                elements: this.elements,
                isLoading: this.isLoading,
                meta: this.meta,
                query: this.query,
            }
        },
    },

    watch: {
    /**
         * This watcher triggers new queries when the parameters change.
         */
        params: {
            deep: true,
            handler () {
                this.query()
            },
        },
    },

    methods: {
    /**
         * Queries the Vuex Module (triggers an index or mustIndex.)
         *
         * @param {boolean} mustGet - if true, forces a new HTTP request. Default false
         *
         * @return {promise}
         */
        query ({ mustGet = false } = {}) {
            if (!mustGet && this.requireParams) {
                if (Object.keys(this.filteredParams).length === 0) {
                    return Promise.resolve()
                }
            }

            this.$emit('is-loading', this.isLoading = true)

            const action = `${this.vuexModule}/${mustGet ? 'mustIndex' : 'index'}`
            return this.$store.dispatch(action, this.filteredParams)
                .then(response => {
                    this.$emit('is-loading', this.isLoading = false)
                    this.url = response.config.url

                    return response
                })
        },
    },

    for (vuexModule) {
        return withHelper(this, {
            computed: {
                vuexModule: () => vuexModule,
                slotParams () {
                    return {
                        [vuexModule]: this.elements,
                        elements: this.elements,
                        isLoading: this.isLoading,
                        meta: this.meta,
                        query: this.query,
                    }
                },
            },
        })
    },

    with (overrides) {
        return withHelper(this, overrides)
    },
}
