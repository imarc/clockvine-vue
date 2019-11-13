import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';

/**
 * Clockvine.with is a helper function that let's you create a new vue
 * component instance from an existing one with functionality changed and
 * overriden.
 *
 * It creates a new component by using lodash's merge, however there's some
 * additional functionality done first:
 *
 * - Within initialOverlay, you can override a prop on initialBase with a
 *   computed property. This gives us a way to change something that has to be
 *   specified within the template to being forced in JS.
 * - Data functions (if they exist) within both objects are called separately
 *   and the results merged. initialOverlay.data() is passed in results of
 *   initialBase.data(), so that you can alter (or reference) data from the
 *   base component.
 */
export default (initialBase, initialOverlay) => {
    const base = cloneDeep(initialBase);
    const overlay = cloneDeep(initialOverlay);


    if (Array.isArray(base.props)) {
        base.props = Object.fromEntries(base.props.map(p => [p, {}]));
    } else if (typeof base.props !== "object") {
        base.props = {};
    }

    if (typeof overlay.computed === "object") {
        Object.keys(overlay.computed)
            .filter(attr => attr in base.props)
            .forEach(attr => {
                delete base.props[attr];
            });
    }

    if (typeof base.data === "function" && typeof overlay.data === "function") {
        const baseData = base.data;
        const overlayData = overlay.data;
        overlay.data = function combinedData() {
            const data = baseData.call(this);
            return merge(data, overlayData.call(this, data));
        };
    }

    return merge(base, overlay);
};
