/**
 * This is a base vue mixin meant to be used with components that are going to
 * connect to a clockvine API via RESTful methods.
 */
export default {
    props: ['id'],

    data: () => ({
        errors: {},
        primaryKey: 'id',
    }),

    computed: {
        exists() {
            return typeof(this[this.primaryKey]) !== "undefined" && this[this.primaryKey] !== null;
        },

        unchangedRecord() {
            return this.$store.state[this.type].records[this[this.primaryKey]] || this.baseRecord();
        },

        record() {
            return this.unchangedRecord;
        },
    },

    methods: {
        handleErrors(error) {
            let errors = error.response.data.errors;

            if (Array.isArray(errors) && errors.length == 1) {
                this.errors = errors[0];
            } else {
                this.errors = error.response.data.errors;
            }
            throw error;
        },

        save() {
            if (this.exists) {
                return this.$store.dispatch(this.type +'/update', {data: this.record, urlParams: this.urlParams, record: this.unchangedRecord})
                    .catch(this.handleErrors);
            } else {
                return this.$store.dispatch(this.type + '/store', {data: this.record, urlParams: this.urlParams})
                    .catch(this.handleErrors);
            }
        },

        destroy() {
            return this.$store.dispatch(this.type + '/destroy', {[this.primaryKey]: this.record[this.primaryKey], urlParams: this.urlParams})
                .catch(this.handleErrors);
        },
    },

    mounted() {
        if (this.exists) {
            this.$store.dispatch(this.type + '/show', {[this.primaryKey]: this[this.primaryKey], urlParams: this.urlParams});
        }
    },
};
