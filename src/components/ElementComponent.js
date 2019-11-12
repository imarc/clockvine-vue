import {singular} from 'pluralize';
import withHelper from '../helpers/with';

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
        if (this.id) {
            return this.show();
        }

        if (this.newElement) {
            return this.$store.dispatch(`${this.vuexModule}/decorate`, this.newElement)
                .then(obj => {
                    this.internalElement = obj;
                });
        }

        return undefined;
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
            } if (this.internalElement) {
                return this.internalElement;
            }

            return undefined;
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
                return undefined;
            }

            this.$emit('isLoading', this.isLoading = true);

            const action = `${this.vuexModule}/${mustGet ? 'mustShow' : 'show'}`;
            return this.$store.dispatch(action, {id: this.id})
                .then(response => {
                    this.$emit('isLoading', this.isLoading = false);
                    this.url = response.config.url;
                });
        },

        store() {
            this.$emit('isLoading', this.isLoading = true);
            this.element.$store()
                .then(() => {
                    this.$emit('isLoading', this.isLoading = false);
                }).then(() => this.$store.dispatch(`${this.vuexModule}/decorate`, this.newElement))
                .then(obj => {
                    this.internalElement = obj;
                });
        },

        update() {
            this.$emit('isLoading', this.isLoading = true);
            const action = `${this.vuexModule}/update`;
            return this.$store.dispatch(action, this.element)
                .then(() => {
                    this.$emit('isLoading', this.isLoading = false);
                });
        },

        destroy() {
            this.$emit('isLoading', this.isLoading = true);
            const action = `${this.vuexModule}/destroy`;
            return this.$store.dispatch(action, this.element)
                .then(() => {
                    this.$emit('isLoading', this.isLoading = false);
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

    for(vuexModule) {
        return withHelper(this, {
            computed: {
                vuexModule: () => vuexModule,
                slotParams() {
                    return {
                        [singular(vuexModule)]: this.element,
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
        });
    },

    with(overrides) {
        return withHelper(this, overrides);
    },
}
