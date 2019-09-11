export default {
    props: {
        urlProperty: {
            type: String,
            default: 'params'
        },
        ignoreParams: {
            type: Object,
            default: {page: 1, orderBy: 'title asc'}
        }
    },

    created() {
        this.onHashChange({newURL: location.href});

        this.$watch(this.urlProperty, {
            deep: true,
            handler() {
                this.onParamsChange();
            }
        });

        addEventListener('hashchange', this.onHashChange.bind(this));
    },

    methods: {
        /**
         * Generates a URL based on the current parameters.
         *
         * @param {object} paramChanges - optionally overlay some parameter changes
         *                                before generating the URL without
         *                                affecting the current params
         *
         * @return {string}
         */
        generateURL(paramChanges = {}) {
            const property = this.urlProperty,
                {ignoreParams} = this;
            const urlParams = new URLSearchParams;

            const params = {...this[property], ...paramChanges};

            for (const [key, val] of Object.entries(params)) {
                if (!(key in ignoreParams) || val !== ignoreParams[key]) {
                    if (val !== undefined && val !== null && val !== '') {
                        urlParams.append(key, val);
                    }
                }
            }

            const urlStr = urlParams.toString();
            if (urlStr.length) {
                return `?${  urlStr}`;
            }
                return location.pathname;

        },

        /**
         * Called when params change.
         */
        onParamsChange() {
            const property = this.urlProperty;
            const urlStr = this.generateURL();
            if (location.search != urlStr) {
                history.replaceState(this[property], document.title, urlStr);
            }
        },

        /**
         * Called on window "hashchange" events.
         */
        onHashChange({newURL}) {
            const {searchParams} = new URL(newURL);
            const props = this[this.urlProperty];

            for (let key of searchParams.keys()) {
                let val = searchParams.getAll(key);

                if (Array.isArray(val) && val.length == 1 && !(/\[\]$/.test(key))) {
                    val = val[0];
                }

                if (/\[\]$/.test(key)) {
                    key = key.replace(/\[\]$/, '');
                }

                if (!(key in props) || props[key] != val) {
                    if (key in props && typeof(props[key]) === 'number') {
                        val = parseFloat(val);
                    }

                    this.$set(props, key, val);
                }
            }
        }
    }
}
