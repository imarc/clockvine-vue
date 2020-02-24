export default class {

    /**
     * Constructs a vue mixin that will keep query string parameters in sync with a vue property.
     *
     * @param {string} property
     * @param {object} ignoreParams - parameters with values to ignore
     */
    constructor(property, ignoreParams = {page: 1, orderBy: 'title asc'})
    {
        this.$_syncsWithUrl_Property = property;
        this.$_syncsWithUrl_ignoreParams = ignoreParams;

        this.props = {
            syncsWithUrl: {
                type: Boolean,
                default: true
            }
        };

        this.created = function created() {
            this.$options.methods.onHashChange.call(this, {newURL: window.location.href});
        };

        this.watch = {
            [property]: {
                deep: true,
                handler: this.methods.onParamsChange,
            },
        };

        window.addEventListener('hashchange', this.methods.onHashChange.bind(this));
    }

    computed = {
        ignoreParams() {
            return this.$options.$_syncsWithUrl_ignoreParams;
        }
    }

    methods = {

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
            const property = this.$options.$_syncsWithUrl_Property;
            const {ignoreParams} = this;
            const urlParams = new URLSearchParams;

            const params = {...this[property], ...paramChanges};

            Object.entries(params)
                .filter(([key, val]) => {
                    return (!(key in ignoreParams) || (val !== ignoreParams[key]))
                        && val !== undefined && val !== null && val !== '';
                }).forEach(([key, val]) => {
                    urlParams.append(key, val);
                });

            const urlStr = urlParams.toString();
            if (urlStr.length) {
                return `?${  urlStr}`;
            }
                return window.location.pathname;

        },

        /**
         * Called when params change.
         */
        onParamsChange() {
            if (!this.syncsWithUrl) {
                return;
            }
            const property = this.$options.$_syncsWithUrl_Property;
                const urlStr = this.generateURL();
            if (window.location.search !== urlStr) {
                window.history.replaceState(this[property], document.title, urlStr);
            }
        },

        /**
         * Called on window "hashchange" events.
         */
        onHashChange({newURL}) {
            if (!this.syncsWithUrl) {
                return;
            }
            const {searchParams} = new URL(newURL);
            const props = this[this.$options.$_syncsWithUrl_Property];

            /* this is because searchParams.entries() is an iterable but not an array. */
            /* eslint no-restricted-syntax: [0] */
            for (let key of searchParams.keys()) {
                let val = searchParams.getAll(key);

                if (Array.isArray(val) && val.length === 1 && !(/\[\]$/.test(key))) {
                    [val] = val;
                }

                if (/\[\]$/.test(key)) {
                    key = key.replace(/\[\]$/, '');
                }

                if (!(key in props) || props[key] !== val) {
                    if (key in props && typeof(props[key]) === 'number') {
                        val = parseFloat(val);
                    }

                    this.$set(props, key, val);
                }
            };
        }
    }
}
