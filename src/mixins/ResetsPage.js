import isEqual from 'lodash/isEqual'

export default class {
  /**
     * Constucts a vue mixin that will reset the page number (or other parameters) on changes.
     *
     * @param {string} paramsProperty - property to watch and modify.
     * @param {array} ignoreProperties - array of properties to ignore changes to.
     * @param {object} resetProperties - Object of properties to 'reset' when a change is detected.
     */
  constructor ({
    paramsProperty = 'params',
    ignoreProperties = ['page'],
    resetProperties = { page: 1 },
    onReset = null
  } = {}) {
    this.paramsProperty = paramsProperty
    this.ignoreProperties = ignoreProperties

    this.watch = {
      [paramsProperty]: {
        deep: true,
        handler (val) {
          const cloneVal = { ...val }
          for (const prop of ignoreProperties) {
            delete cloneVal[prop]
          }

          if (this.$_resetsPage_previousValue !== undefined &&
                        !isEqual(cloneVal, this.$_resetsPage_previousValue)) {
            for (const [prop, value] of Object.entries(resetProperties)) {
              val[prop] = value
            }

            if (typeof onReset === 'function' && this) {
              onReset.call(this, val, this.$_resetsPage_previousValue)
            }

            this.$_resetsPage_previousValue = cloneVal
          } else if (this.$_resetsPage_previousValue === undefined) {
            this.$_resetsPage_previousValue = cloneVal
          }
        }
      }
    }
  }
}
