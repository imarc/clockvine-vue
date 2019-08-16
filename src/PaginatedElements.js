import Elements from './Elements';

export default class {
    computed = {
        page() {
            if (this.params && this.params.page) {
                return this.params.page;
            } else {
                return 1;
            }
        },

        firstPage() {
            return this.page === 1;
        },

        lastPage() {
            if (this.meta) {
                return this.meta.pagination.total_pages <= this.page;
            }
        },
    }

    methods = {
        skipTo(page) {
            this.addParams({page}).query();
        },

        next() {
            if (!this.lastPage) {
                return this.skipTo(this.page + 1);
            }
        },

        previous() {
            if (!this.firstPage) {
                return this.skipTo(this.page - 1);
            }
        },
    }

    constructor(module) {
        this.mixins = [new Elements(module)];
    }
}
