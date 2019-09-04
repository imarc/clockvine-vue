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

        this.created = function() {
            this.$options.methods.onHashChange.call(this, {newURL: location.href});
        };

        this.watch = {
            [property]: {
                deep: true,
                handler: this.methods.onParamsChange,
            },
        };

        addEventListener('hashchange', this.methods.onHashChange.bind(this));
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
            const property = this.$options.$_syncsWithUrl_Property,
                ignoreParams = this.$options.$_syncsWithUrl_ignoreParams;
            let urlParams = new URLSearchParams;

            let params = {...this[property], ...paramChanges};

            for (let [key, val] of Object.entries(params)) {
                if (!(key in ignoreParams) || val !== ignoreParams[key]) {
                    if (val !== undefined && val !== null && val !== '') {
                        urlParams.append(key, val);
                    }
                }
            }

            const urlStr = urlParams.toString();
            if (urlStr.length) {
                return '?' + urlStr;
            } else {
                return location.pathname;
            }
        },

        /**
         * Called when params change.
         */
        onParamsChange() {
            const property = this.$options.$_syncsWithUrl_Property,
                urlStr = this.generateURL();
            if (location.search != urlStr) {
                history.replaceState(this[property], document.title, urlStr);
            }
        },

        /**
         * Called on window "hashchange" events.
         */
        onHashChange({newURL}) {
            const {searchParams} = new URL(newURL);
            const props = this[this.$options.$_syncsWithUrl_Property];

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
