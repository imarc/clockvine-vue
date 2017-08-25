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
                return this.$store.state[this.type].records[this.id] || this.baseRecord();
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
                return this.$store.dispatch(this.type  + '/update', {data: this.localRecord})
                    .then(() => { this.localRecord = null })
                    .catch(this.handleErrors);
            } else {
                return this.$store.dispatch(this.type  + '/store', {data: this.localRecord})
                    .then(() => { this.localRecord = null })
                    .catch(this.handleErrors);
            }
        },
    },

    mounted() {
        this.reset();
    },
};
