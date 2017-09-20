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
                let params = Object.assign({}, this.urlParams, {data: this.record, record: this.unchangedRecord});
                params = Object.assign({}, params, {record: this.unchangedRecord});
                return this.$store.dispatch(this.type + '/update', params)
                    .catch(this.handleErrors);
            } else {
                let params = Object.assign({}, this.urlParams, {data: this.record});
                return this.$store.dispatch(this.type + '/store', params)
                    .catch(this.handleErrors);
            }
        },

        destroy() {
            let params = Object.assign({}, this.urlParams, {[this.primaryKey]: this.record[this.primaryKey]});
            return this.$store.dispatch(this.type + '/destroy', params)
                .catch(this.handleErrors);
        },
    },

    mounted() {
        if (this.exists) {
            let params = Object.assign({}, this.urlParams, {[this.primaryKey]: this[this.primaryKey]});
            this.$store.dispatch(this.type + '/show', params);
        }
    },
};
