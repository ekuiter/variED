import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import Constants from '../Constants';

const tags = Constants.server.featureModelTags;

d3Hierarchy.prototype.feature = function() {
    return this._feature || (this._feature = {
        node: this,
        name: this.data[tags.NAME],
        type: this.data[tags.TYPE],
        description: this.data[tags.DESCRIPTION],
        isAbstract: this.data[tags.ABSTRACT],
        isHidden: this.data[tags.HIDDEN],
        isMandatory: this.data[tags.MANDATORY],
        isGroup: this.data[tags.TYPE] === tags.OR || this.data[tags.TYPE] === tags.ALT,
        hasChildren: this.children && this.children.length > 0,
        getPropertyString: key => {
            if (typeof key === 'function')
                return key(this);
            return this._feature[key] ? 'yes' : 'no';
        }
    });
};

export function getFeatureModel(state) {
    return state.server.featureModel ? new FeatureModel(state.server.featureModel) : null;
}

export default class FeatureModel {
    // 'data' as supplied by FEATURE_MODEL messages from the server
    constructor(featureModel) {
        if (!featureModel)
            throw new Error('no feature model given');
        this._featureModel = featureModel;
    }

    get structure() {
        const struct = Constants.server.featureModelTags.STRUCT;
        if (!this._featureModel[struct] || this._featureModel[struct].length !== 1)
            throw new Error('feature model has no structure');
        return this._featureModel[struct][0];
    }

    get hierarchy() {
        return this._hierarchy || (this._hierarchy = d3Hierarchy(this.structure));
    }
};