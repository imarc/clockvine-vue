import Module from './ApiModule';

/**
 * Construct a new Vuex Module that's meant to work with a
 * Laravel endpoint.
 *
 * @extends Module
 */
export default class extends Module {
    #baseUrl;

    #actionParameter;

    /**
     * Constructor. Only difference from Module is baseUrl must be a string, as
     * this class creates a wrapper function that matches typical Laravel
     * conventions.
     *
     * @param {string} baseUrl         - String for the baseURL
     * @param {string} idProperty      - Property to use for IDs; default "id"
     * @param {string} pageParameter   - Property to use for pages; default "page"
     * @param {object} pqueueOptions   - Override PQueue options; default {concurrency: 2}
     * @param {string} actionParameter - Property that indicates action: default "action"
     */
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
            }

            const id = params[idProperty];
            delete params[idProperty];
            return `${this.#baseUrl  }/${id}`;
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
