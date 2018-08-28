import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import constants from '../constants';
import PropTypes from 'prop-types';
import memoize from '../helpers/memoize';

const serialization = constants.server.featureModel.serialization;

function getName(node) {
    return node.data[serialization.NAME];
}

function isCollapsed(node) {
    return !node.children && node.actualChildren;
}

function hasActualChildren(node) {
    return node.actualChildren && node.actualChildren.length > 0;
}

d3Hierarchy.prototype.feature = function() {
    return this._feature || (this._feature = {
        node: this,
        name: getName(this),
        type: this.data[serialization.TYPE],
        description: this.data[serialization.DESCRIPTION],
        isAbstract: this.data[serialization.ABSTRACT],
        isHidden: this.data[serialization.HIDDEN],
        isMandatory: this.data[serialization.MANDATORY],
        isAnd: this.data[serialization.TYPE] === serialization.AND,
        isOr: this.data[serialization.TYPE] === serialization.OR,
        isAlternative: this.data[serialization.TYPE] === serialization.ALT,
        isGroup:
            this.data[serialization.TYPE] === serialization.OR ||
            this.data[serialization.TYPE] === serialization.ALT,
        isCollapsed: isCollapsed(this),
        hasChildren: this.children && this.children.length > 0,
        hasActualChildren: hasActualChildren(this),
        getPropertyString: key => {
            if (typeof key === 'function')
                return key(this);
            return this._feature[key] ? 'yes' : 'no';
        },
        getNumberOfFeaturesBelow: () => {
            if (!this.actualChildren)
                return 0;
            return this.actualChildren.length +
                this.actualChildren
                    .map(child => child.feature().getNumberOfFeaturesBelow())
                    .reduce((acc, val) => acc + val);
        }
    });
};

class FeatureModel {
    // 'data' as supplied by FEATURE_MODEL messages from the server
    constructor(featureModel, collapsedFeatureNames) {
        if (!featureModel)
            throw new Error('no feature model given');
        this._featureModel = featureModel;
        this._collapsedFeatureNames = collapsedFeatureNames;
    }

    get structure() {
        const struct = constants.server.featureModel.serialization.STRUCT;
        if (!this._featureModel[struct] || this._featureModel[struct].length !== 1)
            throw new Error('feature model has no structure');
        return this._featureModel[struct][0];
    }

    prepare() {
        if (!this._hierarchy || !this._actualNodes || !this._visibleNodes) {
            this._hierarchy = d3Hierarchy(this.structure);
            this._actualNodes = this._hierarchy.descendants();
            this._visibleNodes = [];

            const isVisible = memoize(node => {
                if (!node.parent)
                    return true;
                if (isCollapsed(node.parent))
                    return false;
                return isVisible(node.parent);
            }, node => getName(node));

            this._actualNodes.forEach(node => {
                // store children nodes (because they are changed on collapse)
                node.actualChildren = node.children;

                if (this._collapsedFeatureNames.find(featureName => getName(node) === featureName))
                    node.children = null;

                if (isVisible(node))
                    this._visibleNodes.push(node);
            });
        }
    }

    get hierarchy() {
        this.prepare();
        return this._hierarchy;
    }

    get visibleNodes() {
        this.prepare();
        return this._visibleNodes;
    }

    get actualNodes() {
        this.prepare();
        return this._actualNodes;
    }

    getNode(featureName) {
        return this.actualNodes.find(node => getName(node) === featureName);
    }

    getFeature(featureName) {
        const node = this.getNode(featureName);
        return node ? node.feature() : null;
    }

    getElement(featureName) {
        // Operate under the assumption that we only render ONE feature model, and that it is THIS feature model.
        // This way we don't need to propagate a concrete feature diagram instance.
        const elements = [...document.querySelectorAll('[data-feature]')]
            .filter(node => node.dataset.feature === featureName);
        if (elements.length > 1)
            throw new Error(`multiple features "${featureName}" found - ` +
                'getElement supports only one feature model on the page');
        return elements.length === 1 ? elements[0] : null;
    }

    getVisibleFeatureNames() {
        return this.visibleNodes.map(getName);
    }

    getActualFeatureNames() {
        return this.actualNodes.map(getName);
    }

    getFeatureNamesWithActualChildren() {
        return this.actualNodes.filter(hasActualChildren).map(getName);
    }

    isSiblingFeatures(featureNames) {
        const parents = featureNames
            .map(this.getNode.bind(this))
            .filter(node => node)
            .map(node => node.parent);
        return parents.every(parent => parent === parents[0]);
    }
}

export const FeatureModelType = PropTypes.instanceOf(FeatureModel);

export default FeatureModel;