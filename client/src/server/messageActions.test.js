import messageActions from './messageActions';
import constants from '../constants';
import {sendMessage} from './webSocket';

jest.mock('./webSocket');

const {messageTypes, propertyTypes, groupValueTypes} = constants.server;

describe('messageActions', () => {
    it('undoes a state change', () => {
        messageActions.undo();
        expect(sendMessage).lastCalledWith({type: messageTypes.UNDO});
    });

    it('redoes a state change', () => {
        messageActions.redo();
        expect(sendMessage).lastCalledWith({type: messageTypes.REDO});
    });

    describe('feature', () => {
        it('adds a feature below', () => {
            messageActions.feature.addBelow('FeatureIDE');
            expect(sendMessage).lastCalledWith({type: messageTypes.FEATURE_ADD_BELOW, belowFeature: 'FeatureIDE'});
        });

        it('removes a feature', () => {
            messageActions.feature.remove('FeatureIDE');
            expect(sendMessage).lastCalledWith({type: messageTypes.FEATURE_REMOVE, feature: 'FeatureIDE'});
        });

        it('renames a feature', () => {
            messageActions.feature.rename('FeatureIDE', 'new feature name');
            expect(sendMessage).lastCalledWith(
                {type: messageTypes.FEATURE_RENAME, oldFeature: 'FeatureIDE', newFeature: 'new feature name'});
        });

        it('sets a feature description', () => {
            messageActions.feature.setDescription('FeatureIDE', 'some description');
            expect(sendMessage).lastCalledWith(
                {type: messageTypes.FEATURE_SET_DESCRIPTION, feature: 'FeatureIDE', description: 'some description'});
        });

        describe('properties', () => {
            it('sets the abstract property', () => {
                messageActions.feature.properties.setAbstract('FeatureIDE', true);
                expect(sendMessage).lastCalledWith(
                    {type: messageTypes.FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.abstract, value: true});
            });

            it('sets the hidden property', () => {
                messageActions.feature.properties.setHidden('FeatureIDE', true);
                expect(sendMessage).lastCalledWith(
                    {type: messageTypes.FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.hidden, value: true});
            });

            it('sets the mandatory property', () => {
                messageActions.feature.properties.setMandatory('FeatureIDE', true);
                expect(sendMessage).lastCalledWith(
                    {type: messageTypes.FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true});
            });

            it('toggles the mandatory property', () => {
                messageActions.feature.properties.toggleMandatory({name: 'FeatureIDE', isMandatory: true});
                expect(sendMessage).lastCalledWith(
                    {type: messageTypes.FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: false});

                messageActions.feature.properties.toggleMandatory({name: 'FeatureIDE', isMandatory: false});
                expect(sendMessage).lastCalledWith(
                    {type: messageTypes.FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true});
            });

            it('changes the group type to and', () => {
                messageActions.feature.properties.setAnd('FeatureIDE');
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.and
                });
            });

            it('changes the group type to or', () => {
                messageActions.feature.properties.setOr('FeatureIDE');
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.or
                });
            });

            it('changes the group type to alternative', () => {
                messageActions.feature.properties.setAlternative('FeatureIDE');
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.alternative
                });
            });

            it('toggles the group type from and to or', () => {
                messageActions.feature.properties.toggleGroup({
                    name: 'FeatureIDE',
                    isAnd: true,
                    isOr: false,
                    isAlternative: false
                });
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.or
                });
            });

            it('toggles the group type from or to alternative', () => {
                messageActions.feature.properties.toggleGroup({
                    name: 'FeatureIDE',
                    isAnd: false,
                    isOr: true,
                    isAlternative: false
                });
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.alternative
                });
            });

            it('toggles the group type from alternative to and', () => {
                messageActions.feature.properties.toggleGroup({
                    name: 'FeatureIDE',
                    isAnd: false,
                    isOr: false,
                    isAlternative: true
                });
                expect(sendMessage).lastCalledWith({
                    type: messageTypes.FEATURE_SET_PROPERTY,
                    feature: 'FeatureIDE',
                    property: propertyTypes.group,
                    value: groupValueTypes.and
                });
            });
        });
    });

    describe('features', () => {
        it('adds a feature above', () => {
            messageActions.feature.addAbove(['FeatureIDE', 'Eclipse']);
            expect(sendMessage).lastCalledWith({type: messageTypes.FEATURE_ADD_ABOVE, aboveFeatures: ['FeatureIDE', 'Eclipse']});
        });
    });
});