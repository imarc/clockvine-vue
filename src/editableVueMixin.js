import vueMixin from './vueMixin';

export default {

    mixins: [vueMixin],

    props: ['editable'],

    data: () => ({
        localRecord: null,
    }),

    computed: {
        record() {
            if (this.localRecord) {
                return this.localRecord;
            } else {
                return this.unchangedRecord;
            }
        },

        hasChanges() {
            return this.localRecord !== null;
        },
    },

    methods: {
        reset() {
            this.localRecord = JSON.parse(JSON.stringify(this.record));
        },

        save() {
            if (this.exists) {
                let params = Object.assign({}, this.urlParams, {data: this.localRecord, record: this.unchangedRecord});
                return this.$store.dispatch(this.type  + '/update', params)
                    .then(() => { this.localRecord = null })
                    .catch(this.handleErrors);
            } else {
                let params = Object.assign({}, this.urlParams, {data: this.record});
                return this.$store.dispatch(this.type  + '/store', params)
                    .then(() => { this.localRecord = null })
                    .catch(this.handleErrors);
            }
        },
    },

    mounted() {
        this.reset();
    },
};
