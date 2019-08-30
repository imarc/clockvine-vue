import ElementsComponent from './ElementsComponent';

export default class {

    /**
     * Construct a new Vue component associated with Vuex Module vuexModule. It is
     * similar to Elements, but provides some minor sugar for working with
     * paginated elements. It uses Elements as a mixin.
     *
     * @param {string} vuexModule
     */
    constructor(vuexModule) {
        this.mixins = [new ElementsComponent(vuexModule)];
    };

    computed = {

        /**
         * Return the current page.
         *
         * @return {number}
         */
        page() {
            if (this.params && this.params.page) {
                return this.params.page;
            } else {
                return 1;
            }
        },

        /**
         * Return whether you're on the first page.
         *
         * @return {boolean}
         */
        onFirstPage() {
            return this.page === 1;
        },

        /**
         * Return whether you're on the last page.
         *
         * @return {boolean}
         */
        onLastPage() {
            if (this.meta) {
                return this.meta.pagination.total_pages <= this.page;
            }
        },

        /**
         * Only these properties are exposed to the slot template. First we fetch
         * the 'parentParams' - params that are exposed by Elements - and then add
         * in the ones specific to this class.
         *
         * @return {object}
         */
        slotParams() {
            let parentParams = this.$options.mixins[0].computed.slotParams.call(this);
            return {
                ...parentParams,
                onFirstPage: this.onFirstPage,
                onLastPage: this.onLastPage,
                page: this.page,
            };
        },
    }
}
