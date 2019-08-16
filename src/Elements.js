export default class {
    data = () => ({
        module: null,
        params: {},
        url: null,
    });

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
    };

    methods = {
        addParams(params) {
            this.params = {...this.params, ...params};
            return this;
        },
        setParams(params) {
            this.params = params;
            return this;
        },
        query(params) {
            params = {...this.params, ...params};

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
