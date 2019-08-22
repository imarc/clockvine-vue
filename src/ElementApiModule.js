import Module from './Module';

export default class extends Module {
  #baseUrl;
  #actionParameter;

  constructor(
    baseUrl,
    {
      idProperty = "id",
      pageParameter = "page",
      pqueueOptions = {concurrency: 2},
      actionParameter = "action",
    } = {},
  ) {

    const buildUrl = params => {
      const action = params[this.#actionParameter];
      delete params[this.#actionParameter];

      if (['index', 'store'].includes(action)) {
        return this.#baseUrl;
      } else {
        const id = params[idProperty];
        delete params[idProperty];
        return this.#baseUrl.replace(/\.json$/i, '')
          + `/${id}.json`;
      }
    };

    super(buildUrl, {
      idProperty,
      pageParameter,
      pqueueOptions,
      actionParameter
    });

    this.#actionParameter = actionParameter;
    this.#baseUrl = baseUrl;
  }
}
