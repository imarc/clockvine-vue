import Axios from "axios";
import PQueue from "p-queue";

/**
 * HttpQueue provides a queue for making HTTP requests.
 */
export default class HttpQueue {
    #queue;

    #urls = {};

    /**
     * Constructor.
     *
     * @param {Object} {
     *     pqueueOptions:
     *         An object of options passed to PQueue.
     * }
     */
    constructor({ pqueueOptions = {} } = {}) {
        this.#queue = new PQueue(pqueueOptions);
    }

    /**
     * GETs a URL (if it hasn't already) and returns a promise that will
     * be resolved with the response. If it already has, it resolves immediately.
     *
     * @param {String} url
     * @return {Promise}
     */
    get(url) {
        if (this.#urls[url]) {
            return this.#urls[url];
        }

        return this.mustGet(url);
    }

    /**
     * Always GETs a URL and returns a promise that will be resolved with the
     * response. In general, you should use get() and use mustGet when you
     * need to hit the same URL again.
     *
     * @param {String} url
     * @return {Promise}
     */
    mustGet(url) {
        return this.#urls[url] = this.#queue.add(() => Axios.get(url));
    }

    /**
     * POSTs to a URL and returns a promise that will be resolved with the
     * response.
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    post(url, params) {
        return this.#queue.add(() => Axios.post(url, params));
    }

    /**
     * PUTs to a URL and returns a promise that will be resolved with the
     * response.
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    put(url, params) {
        return this.#queue.add(() => Axios.put(url, params));
    }

    /**
     * DELETEs to a URL and returns a promise that will be resolved with the
     * response.
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    delete(url, params) {
        return this.#queue.add(() => Axios.delete(url, params));
    }
}
