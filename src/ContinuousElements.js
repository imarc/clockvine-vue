import Elements from './Elements';

export default class {
    data = () => ({
        module: null,
        params: {},
        urls: [],
    });

    computed = {
        page() {
            if (this.params && this.params.page) {
                return this.params.page;
            } else {
                return 1;
            }
        },
        elements() {
            if (this.urls.length) {
                return [].concat(...this.urls.map(
                    url => this.$store.getters[`${this.module}/elements`](url)
                ));
            }
        },

        meta() {
            if (this.urls.length) {
                const lastUrl = this.urls[this.urls.length - 1];
                return this.$store.getters[`${this.module}/meta`](lastUrl);
            }
        },

        hasMore() {
            if (this.meta) {
                return this.meta.pagination.total_pages > this.page;
            }
        },
    };

    methods = {
        query(params) {
            return this.$store.dispatch(`${this.module}/index`, {...this.params, ...params})
                .then(response => {
                    this.urls.push(response.config.url);
                });
        },

        fetchMore() {
            if (this.hasMore) {
                this.addParams({
                    page: (this.params.page || 1) + 1,
                });

                this.query();
            }
        }
    };

    constructor(module) {
        this.mixins = [new Elements(module)];
    }
}
