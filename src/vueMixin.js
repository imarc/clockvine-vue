import Vue from 'vue';
import { isEqual } from 'lodash';

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
        saving: false,
    }),

    computed: {
        exists() {
            return this.id || this.record[this.primaryKey];
        },

        storedRecord() {
            return this.$store.state[this.type].records[this.record[this.primaryKey]];
        },

        urlParams() {
            return {};
        }
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
        isDirty() {
            let existingRecord = this.$store.state[this.type].records[this.record[this.primaryKey]];

            return !isEqual(existingRecord, this.record);
        },

        handleErrors(error) {
            let errors = error.response.data.errors;

            if (Array.isArray(errors) && errors.length == 1) {
                this.errors = errors[0];
            } else {
                this.errors = error.response.data.errors;
            }

            this.saving = false;

            return Promise.reject(error.response);
        },

        save() {
            this.saving = true;

            if (this.exists) {
                if (!this.isDirty()) {
                    this.saving = false;
                    return Promise.resolve();
                }

                return this.$store.dispatch(this.type + '/update', this.getRecordParams())
                    .then((r) => {
                        this.saving = false;
                        return Promise.resolve(r);
                    })
                    .catch(this.handleErrors);
            } else {
                return this.$store.dispatch(this.type + '/store', this.getRecordParams())
                    // don't love how this uses the actual response...
                    .then((r) => {
                        this.record[this.primaryKey] = r.data.data.id;
                        this.saving = false;
                        return Promise.resolve(r);
                    })
                    .catch(this.handleErrors);
            }
        },

        destroy() {
            return this.$store.dispatch(this.type + '/destroy', this.getPrimaryKeyParams())
                .catch(this.handleErrors);
        },

        getRecordParams() {
            return Object.assign({}, this.urlParams, { data: this.record });
        },

        getPrimaryKeyParams() {
            return Object.assign({}, this.urlParams, { [this.primaryKey]: this.record[this.primaryKey] });
        },
    },
};
