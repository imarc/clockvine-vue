import isEqual from 'lodash/isEqual';

export default class {
  #previousValue;

  constructor(paramsProperty = 'params', ignoreProperties = ['page'], resetProperties = {page: 1})
  {
    this.paramsProperty = paramsProperty;
    this.ignoreProperties = ignoreProperties;

    this.watch = {
      [paramsProperty]: {
        deep: true,
        handler: val => {
          let cloneVal = {...val};
          for (let prop of ignoreProperties) {
            delete cloneVal[prop];
          }

          if (!isEqual(cloneVal, this.#previousValue)) {
            for (let [prop, value] of Object.entries(resetProperties)) {
              val[prop] = value;
            }
            this.#previousValue = cloneVal;
          }
        },
      },
    };
  }
}
