import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import Constants from '../Constants';

const serialization = Constants.server.featureModel.serialization;

d3Hierarchy.prototype.feature = function() {
    return this._feature || (this._feature = {
        node: this,
        name: this.data[serialization.NAME],
        type: this.data[serialization.TYPE],
        description: this.data[serialization.DESCRIPTION],
        isAbstract: this.data[serialization.ABSTRACT],
        isHidden: this.data[serialization.HIDDEN],
        isMandatory: this.data[serialization.MANDATORY],
        isGroup:
            this.data[serialization.TYPE] === serialization.OR ||
            this.data[serialization.TYPE] === serialization.ALT,
        hasChildren: this.children && this.children.length > 0,
        getPropertyString: key => {
            if (typeof key === 'function')
                return key(this);
            return this._feature[key] ? 'yes' : 'no';
        }
    });
};

export default class FeatureModel {
    // 'data' as supplied by FEATURE_MODEL messages from the server
    constructor(featureModel) {
        if (!featureModel)
            throw new Error('no feature model given');
        this._featureModel = featureModel;
    }

    get structure() {
        const struct = Constants.server.featureModel.serialization.STRUCT;
        if (!this._featureModel[struct] || this._featureModel[struct].length !== 1)
            throw new Error('feature model has no structure');
        return this._featureModel[struct][0];
    }

    get hierarchy() {
        return this._hierarchy || (this._hierarchy = d3Hierarchy(this.structure));
    }
};