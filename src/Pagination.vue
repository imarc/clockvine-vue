<developmenttemplate>
    <nav class="pagination">
        <ul class="pagination__list">
            <li v-if="!onFirstPage" class="pagination__item -previous">
                <a class="pagination__link" @click.prevent="previous">Previous</a>
            </li>
            <li class="pagination__item -first">
                <a class="pagination__link" href @click.prevent="gotoPage(1)">1</a>
            </li>

            <li v-if="links[0] > 2" class="pagination__item -ellipsis">…</li>

            <li class="pagination__item" v-for="link in links" v-text="link" :key="link"></li>

            <li v-if="links[links.length-1]+1 < totalPages" class="pagination__item -ellipsis">…</li>

            <li class="pagination__item -last">
                <a class="pagination__link" href @click.prevent="gotoPage(totalPages)" v-text="totalPages"></a>
            </li>
            <li v-if="!onLastPage" class="pagination__item -next">
                <a class="pagination__link" @click.prevent="next">Next</a>
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
            for (let i = firstLink; i < lastLink; i++) {
                links.push(i);
            }

            if (lastLink === this.totalPages - 1) {
                links.push(this.totalPages - 1);
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
