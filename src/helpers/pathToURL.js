import { compile, match } from 'path-to-regexp';

/**
 * pathToURL combines a pattern and parameters to create a URL. It used the
 * path-to-regexp library for all the heavy lifting.
 *
 * The biggest thing this function does that path-to-regexp itself doesn't do
 * is track which parameters are used. Used params in params are appended as
 * query string parameters, whereas unused parameters in availableParams are
 * ignored.
 *
 * @param {string} pattern - url pattern.
 * @param {object} params - parameters to use or append.
 * @param {object} availableParams - parameters to use or leave out.
 *
 * @returns {String}
 */
export default function (pattern = '', params = {}, availableParams = {}) {
    const path = compile(pattern)({...availableParams, ...params});
    const used = match(pattern)(path);
    const queryParams = {};

    Object.keys(params)
        .filter(param => params[param] && !(param in used.params))
        .forEach(param => {
            queryParams[param] = params[param];
        });

    const searchParams = new URLSearchParams(queryParams);

    return path + (searchParams.toString() ? `?${searchParams}` : '');
};
