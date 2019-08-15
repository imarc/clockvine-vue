import Elements from './Elements';

export default class extends Elements {
    data = () => ({
        module: null,
        params: {},
        urls: [],
    });

    computed = {
        elements() {
            if (this.urls.length) {
                return [].concat(...this.urls.map(
                    url => this.$store.getters[`${this.module}/elements`](url)
                ));
            }
        },

        hasMore() {
            if (this.module && this.urls.length) {
                const lastUrl = this.urls[this.urls.length - 1];
                const {current_page, total_pages} = this.$store.getters[`${this.module}/meta`](lastUrl).pagination;

                console.log(current_page, total_pages);

                return current_page < total_pages;
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
}
