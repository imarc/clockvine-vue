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
            this.$store.dispatch(`${this.module}/index`, {...this.params, ...params})
                .then(response => {
                    this.url = response.config.url;
                });

            return this;
        },

        nextPage() {
            this.addParams({
                page: (this.params.page || 1) + 1,
            });

            return this.query();
        },
        previousPage() {
            if (this.params.page) {
                this.addParams({
                    page: this.params.page - 1,
                });

                return this.query();
            }

            return this;
        }
    };

    constructor(module)
    {
        this.mounted = function() {
            this.module = module;
            this.query();
        };
    }
}
