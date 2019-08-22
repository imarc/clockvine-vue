export default class {
  constructor(property, ignoreParams = {page: 1})
  {
    this.syncingUrlProperty = property;
    this.syncingIgnoreParams = ignoreParams;

    this.created = function() {
      this.$options.methods.onHashChange.call(this, {newURL: location.href});
    };

    this.watch = {
      [property]: {
        deep: true,
        handler: this.methods.onParamsChange,
      },
    };

    addEventListener('hashchange', this.methods.onHashChange.bind(this), {passive: true});
  }

  methods = {
    onParamsChange() {
      let urlParams = new URLSearchParams, historyParams = {};

      for (let [key, val] of Object.entries(this[this.$options.syncingUrlProperty])) {
        if (!(key in this.$options.syncingIgnoreParams) || val !== this.$options.syncingIgnoreParams[key]) {
          if (val !== undefined && val !== null) {
            historyParams[key] = val;
            urlParams.append(key, val);
          }
        }
      }

      let urlStr = urlParams.toString();
      if (urlStr.length) {
        urlStr = '?' + urlStr;
      } else {
        urlStr = location.pathname;
      }

      history.replaceState(historyParams, document.title, urlStr);
    },
    onHashChange({newURL}) {
      const {searchParams} = new URL(newURL);
      const props = this[this.$options.syncingUrlProperty];

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
