import pathToURL from '../helpers/pathToURL';
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
     * All options are passed through to ApiModule.
     *
     * @param {string} baseUrl                 - String for the baseURL
     * @param {string} options.idProperty      - Property to use for IDs; default "id"
     * @param {string} options.actionParameter - Property that indicates action: default "action"
     */
    constructor(baseUrl, options = {}) {
        const actionParameter = options.actionParameter || "action";
        const idProperty = options.idProperty || "id";

        const buildUrl = (params = {}, data = {}) => {
            const action = params[actionParameter];
            delete params[actionParameter];

            if (['index', 'store'].includes(action)) {
                return pathToURL(baseUrl, params, data);
            }

            return pathToURL(`${baseUrl}/:${idProperty}?`, params, data);
        };

        super(buildUrl, options);
    }
}
