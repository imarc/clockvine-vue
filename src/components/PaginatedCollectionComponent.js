import CollectionComponent from './CollectionComponent';

export default CollectionComponent.with({
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
         * Only these properties are exposed to the slot template. First we fetch
         * the 'parentParams' - params that are exposed by Elements - and then add
         * in the ones specific to this class.
         *
         * @return {object}
         */
        slotParams() {
            const parentParams = this.$options.mixins[0].computed.slotParams.call(this);
            return {
                ...parentParams,
                page: this.page,
            };
        },
    },
});
