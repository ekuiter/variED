import GraphicalFeatureModel, {getUUID} from './GraphicalFeatureModel';
import {validFeatureModel, invalidFeatureModel2} from '../fixtures';
import {hierarchy as d3Hierarchy} from 'd3-hierarchy';

describe('feature', () => {
    let graphicalFeatureModel: GraphicalFeatureModel;
    beforeAll(() => {
        graphicalFeatureModel = GraphicalFeatureModel.fromJSON(validFeatureModel).collapse(['FeatureIDE']);
    });

    it('is cached in a node in the hierarchy', () => {
        expect(graphicalFeatureModel.hierarchy._feature).toBeUndefined();
        const feature = graphicalFeatureModel.hierarchy.feature();
        expect(graphicalFeatureModel.hierarchy._feature.uuid).toBe('Eclipse');
        graphicalFeatureModel.hierarchy.feature();
        expect(graphicalFeatureModel.hierarchy._feature).toBe(feature);
    });

    it('stores feature properties', () => {
        const feature = graphicalFeatureModel.getFeature('FeatureIDE');
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
        const feature = graphicalFeatureModel.getFeature('FeatureIDE')!;
        expect(feature.getPropertyString('isAbstract')).toBe('no');
        expect(feature.getPropertyString('isOr')).toBe('yes');
        expect(feature.getPropertyString(node => node.feature().isOr ? 'yes' : 'no')).toBe('yes');
    });

    it('retrieves the number of features below a feature', () => {
        expect(graphicalFeatureModel.getFeature('Eclipse')!.getNumberOfFeaturesBelow()).toBe(18);
        expect(graphicalFeatureModel.getFeature('FeatureModeling')!.getNumberOfFeaturesBelow()).toBe(13);
        expect(graphicalFeatureModel.getFeature('FeatureIDE')!.getNumberOfFeaturesBelow()).toBe(8);
    });
});

describe('GraphicalFeatureModel', () => {
    const createGraphicalFeatureModel = (serializedFeatureModel = validFeatureModel, collapsedFeatureUUIDs = ['FeatureIDE']) =>
        GraphicalFeatureModel.fromJSON(serializedFeatureModel).collapse(collapsedFeatureUUIDs);

    it('creates a representation of a feature model', () => {
        const collapsedFeatureUUIDs: string[] = [],
            graphicalFeatureModel = createGraphicalFeatureModel(validFeatureModel, collapsedFeatureUUIDs);
        expect(graphicalFeatureModel.serializedFeatureModel).toBe(validFeatureModel);
        expect(graphicalFeatureModel.collapsedFeatureUUIDs).toBe(collapsedFeatureUUIDs);
    });

    it('retrieves a feature model\'s structure', () => {
        expect(createGraphicalFeatureModel().structure.uuid).toBe('Eclipse');
    });

    it('errors on invalid structure', () => {
        expect(() => createGraphicalFeatureModel(invalidFeatureModel2).structure).toThrow('feature model has no structure');
    });

    it('prepares a cached hierarchy with visible and actual nodes', () => {
        const graphicalFeatureModel = createGraphicalFeatureModel();
        expect(graphicalFeatureModel._hierarchy).toBeUndefined();
        graphicalFeatureModel.prepare();
        const hierarchy = graphicalFeatureModel._hierarchy;
        expect(hierarchy).toBeInstanceOf(d3Hierarchy);
        graphicalFeatureModel.prepare();
        expect(graphicalFeatureModel._hierarchy).toBe(hierarchy);
    });

    it('retrieves a hierarchy', () => {
        expect(createGraphicalFeatureModel().hierarchy).toBeInstanceOf(d3Hierarchy);
    });

    it('retrieves visible nodes', () => {
        const visibleNodes = createGraphicalFeatureModel().visibleNodes;
        expect(visibleNodes.map(getUUID)).toContain('Eclipse');
        expect(visibleNodes.map(getUUID)).toContain('FeatureIDE');
        expect(visibleNodes.map(getUUID)).not.toContain('FeatureHouse');
    });

    it('retrieves actual nodes', () => {
        const actualNodes = createGraphicalFeatureModel().actualNodes;
        expect(actualNodes.map(getUUID)).toContain('Eclipse');
        expect(actualNodes.map(getUUID)).toContain('FeatureIDE');
        expect(actualNodes.map(getUUID)).toContain('FeatureHouse');
    });

    it('retrieves a node', () => {
        expect(getUUID(createGraphicalFeatureModel().getNode('FeatureIDE')!)).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid node', () => {
        expect(createGraphicalFeatureModel().getNode('<invalid feature>')).toBeUndefined();
    });

    it('retrieves a feature', () => {
        expect(createGraphicalFeatureModel().getFeature('FeatureIDE')!.uuid).toBe('FeatureIDE');
    });

    it('does not retrieve an invalid feature', () => {
        expect(createGraphicalFeatureModel().getFeature('<invalid feature>')).toBeUndefined();
    });

    it('retrieves visible feature names', () => {
        const visibleFeatureUUIDs = createGraphicalFeatureModel().getVisibleFeatureUUIDs();
        expect(visibleFeatureUUIDs).toContain('Eclipse');
        expect(visibleFeatureUUIDs).toContain('FeatureIDE');
        expect(visibleFeatureUUIDs).not.toContain('FeatureHouse');
    });

    it('retrieves actual feature names', () => {
        const actualFeatureUUIDs = createGraphicalFeatureModel().getActualFeatureUUIDs();
        expect(actualFeatureUUIDs).toContain('Eclipse');
        expect(actualFeatureUUIDs).toContain('FeatureIDE');
        expect(actualFeatureUUIDs).toContain('FeatureHouse');
    });

    it('retrieves feature names with actual children', () => {
        const featureUUIDsWithActualChildren = createGraphicalFeatureModel().getFeatureUUIDsWithActualChildren();
        expect(featureUUIDsWithActualChildren).toContain('Eclipse');
        expect(featureUUIDsWithActualChildren).toContain('FeatureIDE');
        expect(featureUUIDsWithActualChildren).not.toContain('FeatureHouse');
    });

    it('checks whether features are siblings', () => {
        const graphicalFeatureModel = createGraphicalFeatureModel();
        expect(graphicalFeatureModel.isSiblingFeatures(['FeatureHouse', 'Munge', 'Antenna'])).toBe(true);
        expect(graphicalFeatureModel.isSiblingFeatures(['FeatureHouse', 'Eclipse'])).toBe(false);
    });
});