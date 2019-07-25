import Module from './Module';

export default class extends Module {
    #baseUrl;
    #actionParameter;

    constructor(
        baseUrl,
        {
            indexProperty = "id",
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
                return this.#baseUrl.replace(/\.json$/i, '')
                    + `/${params[this.indexProperty]}.json`;
            }
        };

        super(buildUrl, {
            indexProperty,
            pageParameter,
            pqueueOptions,
            actionParameter
        });

        this.#actionParameter = actionParameter;
        this.#baseUrl = baseUrl;
    }
}
