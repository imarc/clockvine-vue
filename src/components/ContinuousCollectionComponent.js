import isEqual from 'lodash/isEqual';
import CollectionComponent from './CollectionComponent';

export default {

    mixins: [CollectionComponent],

    data: () => ({
        /**
         * Common parameters to all active URLs, to determine whether to empty the urls array.
         */
        commonParams: {},
        /**
         * Array of current URLs.
         */
        urls: [],
    }),


    computed: {
        /**
         * Return the current page.
         *
         * @return {number}
         */
        page() {
            if (this.params && this.params.page) {
                return this.params.page;
            }
                return 1;

        },

        /**
         * Override the elements property from Elements with one that combines the
         * results from all URLs in the urls property.
         *
         * @return {array}
         */
        elements() {
            if (this.urls.length) {
                return [].concat(...this.urls.map(
                    url => this.$store.getters[`${this.vuexModule}/elements`](url)
                ));
            }
        },

        /**
         * Return the meta information for the last URL.
         *
         * @return {object}
         */
        meta() {
            if (this.urls.length) {
                const lastUrl = this.urls[this.urls.length - 1];
                return this.$store.getters[`${this.vuexModule}/meta`](lastUrl);
            }
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
        query({mustGet = false} = {}) {
            const clonedParams = {...this.filteredParams};
            let clearExisting = false;
            const parentQuery = this.$options.mixins[0].methods.query;

            delete clonedParams.page;

            if (!isEqual(clonedParams, this.commonParams)) {
                clearExisting = true;
                this.commonParams = clonedParams;
            }

            return parentQuery.call(this, {mustGet})
                .then(response => {
                    if (clearExisting) {
                        this.urls = [response.config.url];
                    } else {
                        this.urls.push(response.config.url);
                    }
                });
        },
    },
}
