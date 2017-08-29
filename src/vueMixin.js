/**
 * This is a base vue mixin meant to be used with components that are going to
 * connect to a clockvine API via RESTful methods.
 */
export default {
    props: ['id'],

    data: () => ({
        errors: {},
    }),

    computed: {
        exists() {
            return typeof(this.id) !== "undefined" && this.id !== null;
        },

        record() {
            return this.$store.state[this.type].records[this.id] || this.baseRecord();
        },
    },

    methods: {
        handleErrors(error) {
            this.errors = error.response.data;
            throw error;
        },

        save() {
            if (this.exists) {
                return this.$store.dispatch(this.type +'/update', {data: this.record, urlParams: this.urlParams})
                    .catch(this.handleErrors);
            } else {
                return this.$store.dispatch(this.type + '/store', {data: this.record, urlParams: this.urlParams})
                    .catch(this.handleErrors);
            }
        },

        destroy() {
            return this.$store.dispatch(this.type + '/destroy', {id: this.record.id, urlParams: this.urlParams})
                .catch(this.handleErrors);
        },
    },

    mounted() {
        if (this.exists) {
            this.$store.dispatch(this.type + '/show', {id: this.id, urlParams: this.urlParams});
        }
    },
};
