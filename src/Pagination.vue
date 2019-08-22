<template>
    <nav v-if="totalPages" class="pagination">
        <ul class="pagination__list">
            <li v-if="!onFirstPage" class="pagination__item -previous">
                <a class="pagination__link" @click.prevent="previous">
                    <span class="sr-only">Previous</span>
                </a>
            </li>
            <li class="pagination__item -first" :class="{'-active': value === 1}">
                <a v-if="value !== 1" class="pagination__link" href="" @click.prevent="gotoPage(1)">1</a>
                <span v-else class="pagination__link -current">1</span>
            </li>

            <li v-if="links[0] > 2" class="pagination__item -ellipsis">
                <span class="pagination__link">…</span>
            </li>

            <li v-for="link in links" :key="link" class="pagination__item" :class="{'-active': value === link}">
                <a v-if="value !== link" class="pagination__link" href="" @click.prevent="gotoPage(link)" v-text="link"></a>
                <span v-else class="pagination__link -current" v-text="link"></span>
            </li>

            <li v-if="links[links.length-1]+1 < totalPages" class="pagination__item -ellipsis">
                <span class="pagination__link">…</span>
            </li>

            <li v-if="totalPages > 1" class="pagination__item -last" :class="{'-active': value === totalPages}">
                <a v-if="value !== totalPages" class="pagination__link" href="" @click.prevent="gotoPage(totalPages)" v-text="totalPages"></a>
                <span v-else class="pagination__link -current" v-text="totalPages"></span>
            </li>
            <li v-if="!onLastPage" class="pagination__item -next">
                <a class="pagination__link" @click.prevent="next">
                    <span class="sr-only">Next</span>
                </a>
            </li>
        </ul>
    </nav>
</template>
<script>
export default {
    props: {
        totalPages: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        radius: {
            type: Number,
            default: 3,
        },
    },
    computed: {
        onFirstPage() {
            return this.value === 1;
        },

        onLastPage() {
            return this.value >= this.totalPages;
        },

        links() {
            const firstLink = Math.max(this.value - this.radius, 2);
            const lastLink = Math.min(
                firstLink + this.radius * 2 + 1,
                this.totalPages - 1
            );

            let links = [];

            if (firstLink == 3) {
                links.unshift(2);
            }
            for (let i = firstLink; i <= lastLink; i++) {
                links.push(i);
            }

            return links;
        },
    },

    methods: {
        previous() {
            this.gotoPage(this.value - 1);
        },
        next() {
            this.gotoPage(this.value + 1);
        },
        gotoPage(page) {
            page = Math.max(1, Math.min(page, this.totalPages));
            if (page != this.value) {
                this.$emit("input", page);
            }
        },
    },
}
</script>
