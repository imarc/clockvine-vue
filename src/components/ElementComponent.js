import {singular} from 'pluralize';
import withHelper from '../helpers/with';

export default {

    props: {
        vuexModule: {
            type: String,
            required: true,
        },

        params: {
            type: Object,
            default: () => ({}),
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
            return this.$store.dispatch(`${this.vuexModule}/decorate`, {
                params: this.params,
                elements: this.newElement,
            }).then(obj => {
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
                return this.$store.dispatch(`${this.vuexModule}/decorate`, {
                    params: this.params,
                    elements: this.element,
                });
            }

            this.$emit('isLoading', this.isLoading = true);

            const action = `${this.vuexModule}/${mustGet ? 'mustShow' : 'show'}`;
            return this.$store.dispatch(action, {...this.params, id: this.id})
                .then(response => {
                    this.$emit('isLoading', this.isLoading = false);
                    this.url = response.config.url;
                });
        },

        store() {
            this.$emit('isLoading', this.isLoading = true);
            return this.element.$store()
                .then(() => {
                    this.$emit('isLoading', this.isLoading = false);
                }).then(() => this.$store.dispatch(`${this.vuexModule}/decorate`, {
                    params: this.params,
                    elements: this.newElement,
                })).then(obj => {
                    this.internalElement = obj;
                });
        },

        update() {
            this.$emit('isLoading', this.isLoading = true);
            return this.element.$update()
                .then(() => {
                    this.$emit('isLoading', this.isLoading = false);
                });
        },

        destroy() {
            this.$emit('isLoading', this.isLoading = true);
            return this.element.$destroy()
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

    /**
     * This is a sugar method for ElementComponent instances. This method
     * returns a new instance of ElementComponent, except that vuexModule is no
     * longer an available property; it's converted into a computed property
     * (thanks to Clockvine.with) set to the value passed to .for(). Further,
     * it additionally adds to the vue-slot a singularized version of the vuex
     * module as an alternative to 'element'.
     *
     * For example, doing this:
     *
     * Vue.component('user', ElementComponent.for('users'));
     *
     * let's you do this:
     *
     * <user v-slot="{ user }">...</user>
     *
     *
     *
     * As sugar for doing this:
     *
     * Vue.component('user', ElementComponent);
     *
     * and this:
     *
     * <user vuex-module="users" v-slot="{ element: user }">...</user>
     *
     * @param {string} vuexModule - the vuex module for this instance.
     *
     * @return {object} - a tweaked ElementComponent instance
     */
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

    /**
     * This is a sugar method for ElementComponent instances.
     *
     *     ElementComponent.with(obj)
     *
     * is a shorthand for
     *
     *     Clockvine.with(ElementComponent, obj)
     *
     * You'll likely want to read Clockvine.with's documentation for details.
     *
     * @param {object} overrides
     */
    with(overrides) {
        return withHelper(this, overrides);
    },
}
