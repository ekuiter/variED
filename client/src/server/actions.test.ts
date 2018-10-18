import serverActions, {SERVER_SEND} from './actions';
import constants from '../constants';
import {MessageType} from '../types';

const {propertyTypes, groupValueTypes} = constants.server;

function expectServerAction(action: any, payload: any) {
    expect(action).toEqual({type: SERVER_SEND, payload});
}

describe('actions', () => {
    it('undoes a state change', () => {
        expectServerAction(serverActions.undo(), {type: MessageType.UNDO});
    });

    it('redoes a state change', () => {
        expectServerAction(serverActions.redo(), {type: MessageType.REDO});
    });

    describe('feature', () => {
        it('adds a feature below', () => {
            expectServerAction(serverActions.featureDiagram.feature.addBelow({belowFeatureName: 'FeatureIDE'}),
                {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: 'FeatureIDE'});
        });

        it('removes a feature', () => {
            expectServerAction(serverActions.featureDiagram.feature.remove({featureNames: ['FeatureIDE']}),
                [{type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: 'FeatureIDE'}]);
        });

        it('renames a feature', () => {
            expectServerAction(serverActions.featureDiagram.feature.rename({oldFeatureName: 'FeatureIDE', newFeatureName: 'new feature name'}),
                {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: 'FeatureIDE', newFeature: 'new feature name'});
        });

        it('sets a feature description', () => {
            expectServerAction(serverActions.featureDiagram.feature.setDescription({featureName: 'FeatureIDE', description: 'some description'}),
                {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: 'FeatureIDE', description: 'some description'});
        });

        describe('properties', () => {
            it('sets the abstract property', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setAbstract({featureNames: ['FeatureIDE'], value: true}),
                    [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.abstract, value: true}]);
            });

            it('sets the hidden property', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setHidden({featureNames: ['FeatureIDE'], value: true}),
                    [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.hidden, value: true}]);
            });

            it('sets the mandatory property', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setMandatory({featureNames: ['FeatureIDE'], value: true}),
                    [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true}]);
            });

            it('toggles the mandatory property', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.toggleMandatory({feature: <any>{name: 'FeatureIDE', isMandatory: true}}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: false});
                expectServerAction(serverActions.featureDiagram.feature.properties.toggleMandatory({feature: <any>{name: 'FeatureIDE', isMandatory: false}}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true});
            });

            it('changes the group type to and', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setAnd({featureNames: ['FeatureIDE']}), [{
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.and
                }]);
            });

            it('changes the group type to or', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setOr({featureNames: ['FeatureIDE']}), [{
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.or
                }]);
            });

            it('changes the group type to alternative', () => {
                expectServerAction(serverActions.featureDiagram.feature.properties.setAlternative({featureNames: ['FeatureIDE']}), [{
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.alternative
                }]);
            });

            it('toggles the group type from and to or', () => {
                expectServerAction(
                    serverActions.featureDiagram.feature.properties.toggleGroup({
                        feature: <any>{
                            name: 'FeatureIDE',
                            isAnd: true,
                            isOr: false,
                            isAlternative: false
                        }
                    }), {
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.or
                    });
            });

            it('toggles the group type from or to alternative', () => {
                expectServerAction(
                    serverActions.featureDiagram.feature.properties.toggleGroup({
                        feature: <any>{
                            name: 'FeatureIDE',
                            isAnd: false,
                            isOr: true,
                            isAlternative: false
                        }
                    }), {
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.alternative
                    });
            });

            it('toggles the group type from alternative to and', () => {
                expectServerAction(
                    serverActions.featureDiagram.feature.properties.toggleGroup({
                        feature: <any>{
                            name: 'FeatureIDE',
                            isAnd: false,
                            isOr: false,
                            isAlternative: true
                        }
                    }), {
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.and
                    });
            });
        });
    });

    describe('features', () => {
        it('adds a feature above', () => {
            expectServerAction(serverActions.featureDiagram.feature.addAbove({aboveFeaturesNames: ['FeatureIDE', 'Eclipse']}),
                {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: ['FeatureIDE', 'Eclipse']});
        });
    });
});