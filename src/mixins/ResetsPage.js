import isEqual from 'lodash/isEqual';

export default {

    data: () => ({
        $_resetsPage_previousValue: undefined,
    }),

    props: {
        paramsProperty: {
            type: String,
            required: true,
        },
        ignoreProperties: {
            type: Array,
            default: () => ['page'],
        },
        resetProperties: {
            type: Object,
            default: () => ({page: 1}),
        },
        onReset: {
            type: Function,
        }
    },

    created() {
        this.$watch(this.paramsProperty, {
            deep: true,
            handler(val) {
                const cloneVal = {...val};
                for (const prop of this.ignoreProperties) {
                    delete cloneVal[prop];
                }

                if (this.$_resetsPage_previousValue === undefined) {
                    this.$_resetsPage_previousValue = cloneVal;
                    return;
                }

                if (isEqual(cloneVal, this.$_resetsPage_previousValue)) {
                    return;
                }

                if (this.$_resetsPage_previousValue !== undefined) {
                    for (const [prop, value] of Object.entries(this.resetProperties)) {
                        val[prop] = value;
                    }

                    if (typeof onReset === 'function' && this) {
                        onReset.call(this, val, this.$_resetsPage_previousValue);
                    }
                }

                this.$_resetsPage_previousValue = cloneVal;
            },
        });
    }
}
