import FeatureModel, {getID} from './FeatureModel';
import {validFeatureModel, invalidFeatureModel2} from '../fixtures';
import {hierarchy as d3Hierarchy} from 'd3-hierarchy';

describe('feature', () => {
    let featureModel: FeatureModel;
    beforeAll(() => {
        featureModel = FeatureModel.fromJSON(validFeatureModel).collapse(['FeatureIDE']);
    });

    it('is cached in a node in the hierarchy', () => {
        expect(featureModel.hierarchy._feature).toBeUndefined();
        const feature = featureModel.hierarchy.feature();
        expect(featureModel.hierarchy._feature.ID).toBe('Eclipse');
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
        const feature = featureModel.getFeature('FeatureIDE')!;
        expect(feature.getPropertyString('isAbstract')).toBe('no');
        expect(feature.getPropertyString('isOr')).toBe('yes');
        expect(feature.getPropertyString(node => node.feature().isOr ? 'yes' : 'no')).toBe('yes');
    });

    it('retrieves the number of features below a feature', () => {
        expect(featureModel.getFeature('Eclipse')!.getNumberOfFeaturesBelow()).toBe(18);
        expect(featureModel.getFeature('FeatureModeling')!.getNumberOfFeaturesBelow()).toBe(13);
        expect(featureModel.getFeature('FeatureIDE')!.getNumberOfFeaturesBelow()).toBe(8);
    });
});

describe('FeatureModel', () => {
    const createFeatureModel = (serializedFeatureModel = validFeatureModel, collapsedfeatureIDs = ['FeatureIDE']) =>
        FeatureModel.fromJSON(serializedFeatureModel).collapse(collapsedfeatureIDs);

    it('creates a representation of a feature model', () => {
        const collapsedfeatureIDs: string[] = [],
            featureModel = createFeatureModel(validFeatureModel, collapsedfeatureIDs);
        expect(featureModel.serializedFeatureModel).toBe(validFeatureModel);
        expect(featureModel.collapsedfeatureIDs).toBe(collapsedfeatureIDs);
    });

    it('retrieves a feature model\'s structure', () => {
        expect(createFeatureModel().structure.ID).toBe('Eclipse');
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
        expect(visibleNodes.map(getID)).toContain('Eclipse');
        expect(visibleNodes.map(getID)).toContain('FeatureIDE');
        expect(visibleNodes.map(getID)).not.toContain('FeatureHouse');
    });

    it('retrieves actual nodes', () => {
        const actualNodes = createFeatureModel().actualNodes;
        expect(actualNodes.map(getID)).toContain('Eclipse');
        expect(actualNodes.map(getID)).toContain('FeatureIDE');
        expect(actualNodes.map(getID)).toContain('FeatureHouse');
    });

    it('retrieves a node', () => {
        expect(getID(createFeatureModel().getNode('FeatureIDE')!)).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid node', () => {
        expect(createFeatureModel().getNode('<invalid feature>')).toBeUndefined();
    });

    it('retrieves a feature', () => {
        expect(createFeatureModel().getFeature('FeatureIDE')!.ID).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid feature', () => {
        expect(createFeatureModel().getFeature('<invalid feature>')).toBeUndefined();
    });

    it('retrieves visible feature names', () => {
        const visiblefeatureIDs = createFeatureModel().getVisiblefeatureIDs();
        expect(visiblefeatureIDs).toContain('Eclipse');
        expect(visiblefeatureIDs).toContain('FeatureIDE');
        expect(visiblefeatureIDs).not.toContain('FeatureHouse');
    });

    it('retrieves actual feature names', () => {
        const actualfeatureIDs = createFeatureModel().getActualfeatureIDs();
        expect(actualfeatureIDs).toContain('Eclipse');
        expect(actualfeatureIDs).toContain('FeatureIDE');
        expect(actualfeatureIDs).toContain('FeatureHouse');
    });

    it('retrieves feature names with actual children', () => {
        const featureIDsWithActualChildren = createFeatureModel().getfeatureIDsWithActualChildren();
        expect(featureIDsWithActualChildren).toContain('Eclipse');
        expect(featureIDsWithActualChildren).toContain('FeatureIDE');
        expect(featureIDsWithActualChildren).not.toContain('FeatureHouse');
    });

    it('checks whether features are siblings', () => {
        const featureModel = createFeatureModel();
        expect(featureModel.isSiblingFeatures(['FeatureHouse', 'Munge', 'Antenna'])).toBe(true);
        expect(featureModel.isSiblingFeatures(['FeatureHouse', 'Eclipse'])).toBe(false);
    });
});