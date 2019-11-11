import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';

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
