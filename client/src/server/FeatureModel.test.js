import FeatureModel, {getName} from './FeatureModel';
import {validFeatureModel, invalidFeatureModel2} from '../fixtures';
import {hierarchy as d3Hierarchy} from 'd3-hierarchy';

describe('feature', () => {
    let featureModel;
    beforeAll(() => {
        featureModel = new FeatureModel(validFeatureModel, ['FeatureIDE']);
    });

    it('is cached in a node in the hierarchy', () => {
        expect(featureModel.hierarchy._feature).toBeUndefined();
        const feature = featureModel.hierarchy.feature();
        expect(featureModel.hierarchy._feature.name).toBe('Eclipse');
        featureModel.hierarchy.feature();
        expect(featureModel.hierarchy._feature).toBe(feature);
    });

    it('stores feature properties', () => {
        const feature = featureModel.getFeature('FeatureIDE');
        expect(feature).toMatchObject({
            name: 'FeatureIDE',
            type: 'or',
            description: 'A sample description',
            isAbstract: false,
            isHidden: false,
            isMandatory: false,
            isAnd: false,
            isOr: true,
            isAlternative: false,
            isGroup: true,
            isCollapsed: true,
            hasChildren: false,
            hasActualChildren: true
        });
    });

    it('retrieves strings that describe feature properties', () => {
        const feature = featureModel.getFeature('FeatureIDE');
        expect(feature.getPropertyString('isAbstract')).toBe('no');
        expect(feature.getPropertyString('isOr')).toBe('yes');
        expect(feature.getPropertyString(node => node.feature().isOr ? 'yes' : 'no')).toBe('yes');
    });

    it('retrieves the number of features below a feature', () => {
        expect(featureModel.getFeature('Eclipse').getNumberOfFeaturesBelow()).toBe(18);
        expect(featureModel.getFeature('FeatureModeling').getNumberOfFeaturesBelow()).toBe(13);
        expect(featureModel.getFeature('FeatureIDE').getNumberOfFeaturesBelow()).toBe(8);
    });
});

describe('FeatureModel', () => {
    const createFeatureModel = (featureModel = validFeatureModel, collapsedFeatureNames = ['FeatureIDE']) =>
        new FeatureModel(featureModel, collapsedFeatureNames);

    it('creates a representation of a feature model', () => {
        const collapsedFeatureNames = [],
            featureModel = createFeatureModel(validFeatureModel, collapsedFeatureNames);
        expect(featureModel._featureModel).toBe(validFeatureModel);
        expect(featureModel._collapsedFeatureNames).toBe(collapsedFeatureNames);
    });

    it('errors on invalid parameters', () => {
        expect(() => new FeatureModel()).toThrow('no feature model given');
        expect(() => new FeatureModel(validFeatureModel)).toThrow('no collapsed feature names given');
    });

    it('retrieves a feature model\'s structure', () => {
        expect(createFeatureModel().structure.name).toBe('Eclipse');
    });

    it('errors on invalid structure', () => {
        expect(() => createFeatureModel(invalidFeatureModel2).structure).toThrow('feature model has no structure');
    });

    it('prepares a cached hierarchy with visible and actual nodes', () => {
        const featureModel = createFeatureModel();
        expect(featureModel._hierarchy).toBeUndefined();
        featureModel.prepare();
        const hierarchy = featureModel._hierarchy;
        expect(hierarchy).toBeInstanceOf(d3Hierarchy);
        featureModel.prepare();
        expect(featureModel._hierarchy).toBe(hierarchy);
    });

    it('retrieves a hierarchy', () => {
        expect(createFeatureModel().hierarchy).toBeInstanceOf(d3Hierarchy);
    });

    it('retrieves visible nodes', () => {
        const visibleNodes = createFeatureModel().visibleNodes;
        expect(visibleNodes.map(getName)).toContain('Eclipse');
        expect(visibleNodes.map(getName)).toContain('FeatureIDE');
        expect(visibleNodes.map(getName)).not.toContain('FeatureHouse');
    });

    it('retrieves actual nodes', () => {
        const actualNodes = createFeatureModel().actualNodes;
        expect(actualNodes.map(getName)).toContain('Eclipse');
        expect(actualNodes.map(getName)).toContain('FeatureIDE');
        expect(actualNodes.map(getName)).toContain('FeatureHouse');
    });

    it('retrieves a node', () => {
        expect(getName(createFeatureModel().getNode('FeatureIDE'))).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid node', () => {
        expect(createFeatureModel().getNode('<invalid feature>')).toBeUndefined();
    });

    it('retrieves a feature', () => {
        expect(createFeatureModel().getFeature('FeatureIDE').name).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid feature', () => {
        expect(createFeatureModel().getFeature('<invalid feature>')).toBeNull();
    });

    it('retrieves visible feature names', () => {
        const visibleFeatureNames = createFeatureModel().getVisibleFeatureNames();
        expect(visibleFeatureNames).toContain('Eclipse');
        expect(visibleFeatureNames).toContain('FeatureIDE');
        expect(visibleFeatureNames).not.toContain('FeatureHouse');
    });

    it('retrieves actual feature names', () => {
        const actualFeatureNames = createFeatureModel().getActualFeatureNames();
        expect(actualFeatureNames).toContain('Eclipse');
        expect(actualFeatureNames).toContain('FeatureIDE');
        expect(actualFeatureNames).toContain('FeatureHouse');
    });

    it('retrieves feature names with actual children', () => {
        const featureNamesWithActualChildren = createFeatureModel().getFeatureNamesWithActualChildren();
        expect(featureNamesWithActualChildren).toContain('Eclipse');
        expect(featureNamesWithActualChildren).toContain('FeatureIDE');
        expect(featureNamesWithActualChildren).not.toContain('FeatureHouse');
    });

    it('checks whether features are siblings', () => {
        const featureModel = createFeatureModel();
        expect(featureModel.isSiblingFeatures(['FeatureHouse', 'Munge', 'Antenna'])).toBe(true);
        expect(featureModel.isSiblingFeatures(['FeatureHouse', 'Eclipse'])).toBe(false);
    });
});