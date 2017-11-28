import Vue from 'vue';

/**
 * This is a base vue mixin meant to be used with components that are going to
 * connect to a clockvine API via RESTful methods.
 */
export default {
    props: ['id'],

    data: () => ({
        errors: {},
        primaryKey: 'id',
        record: {},
    }),

    computed: {
        exists() {
            return this.record[this.primaryKey] !== undefined;
        },

        storedRecord() {
            return this.$store.state[this.type].records[this.record[this.primaryKey]];
        },
    },

    created() {
        this.record[this.primaryKey] = this[this.primaryKey];
    },

    mounted() {
        if (this.exists) {
            this.$store.dispatch(this.type + '/show', this.getPrimaryKeyParams())
                .then(() => { this.record = this.storedRecord && JSON.parse(JSON.stringify(this.storedRecord)); })
        }
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
                return this.$store.dispatch(this.type + '/update', this.getRecordParams())
                    .catch(this.handleErrors);
            } else {
                return this.$store.dispatch(this.type + '/store', this.getRecordParams())
                    // don't love how this uses the actual response...
                    .then((r) => { this.record[this.primaryKey] = r.data.data.id; })
                    .catch(this.handleErrors);
            }
        },

        destroy() {
            return this.$store.dispatch(this.type + '/destroy', this.getPrimaryKeyParams())
                .catch(this.handleErrors);
        },

        getRecordParams() {
            return { data: this.record };
        },

        getPrimaryKeyParams() {
            return { [this.primaryKey]: this.record[this.primaryKey] };
        },
    },
};
