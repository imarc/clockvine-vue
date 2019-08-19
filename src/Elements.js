export default class {
    data = () => ({
        module: null,
        url: null,
        internalParams: {},
    });

    props = {
        params: {
            type: Object,
            default: () => ({}),
        },
    }

    render = function() {
        return this.$scopedSlots.default({
            elements: this.elements,
            meta: this.meta,
            firstPage: this.firstPage,
            previous: this.previous,
            lastPage: this.lastPage,
            next: this.next,
            query: this.query,
        });
    }

    computed = {
        elements() {
            if (this.url) {
                return this.$store.getters[`${this.module}/elements`](this.url);
            }
        },
        meta() {
            if (this.url) {
                return this.$store.getters[`${this.module}/meta`](this.url);
            }
        },
        flattenedParams() {
            return {...this.params, ...this.internalParams};
        },
    }

    watch = {
        params(newVal, oldVal) {
            console.log(newVal, oldVal);
        },
    }

    methods = {
        addParams(params) {
            for (let key in params) {
                this.$set(this.internalParams, key, params[key]);
            }

            if (!('page' in params)) {
                this.$set(this.internalParams, 'page', 1);
            }

            console.log('here', this.internalParams);

            return this;
        },
        setParams(params) {
            this.internalParams = params;
            return this;
        },
        query(params) {
            params = {...this.flattenedParams, ...params};

            console.log('querying with params', params);

            if (params.page === 1) {
                delete params.page;
            }

            return this.$store.dispatch(`${this.module}/index`, params)
                .then(response => {
                    this.url = response.config.url;
                });
        },
    };

    constructor(module)
    {
        this.mounted = function() {
            this.module = module;
            this.query();
        };
    }
}
