import React from 'react';
import {shallow} from 'enzyme';
import FeatureRenameDialog from './FeatureRenameDialog';
import GraphicalFeatureModel from '../../modeling/GraphicalFeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import {defaultSettings} from '../../store/settings';

describe('FeatureRenameDialog', () => {
    let featureRenameDialog: JSX.Element, onRenameFeature: jest.Mock;

    beforeEach(() => {
        const mock = jest.fn();
        onRenameFeature = jest.fn();
        featureRenameDialog = (
            <FeatureRenameDialog
                isOpen={true}
                onDismiss={mock}
                graphicalFeatureModel={GraphicalFeatureModel.fromJSON(validFeatureModel)}
                featureName="FeatureIDE"
                settings={defaultSettings}
                onRenameFeature={onRenameFeature}/>
        );
    });

    it('renders a dialog for renaming a feature', () => {
        const wrapper = shallow(featureRenameDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('FeatureIDE');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureRenameDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'new feature name');
        expect(onRenameFeature).lastCalledWith({oldFeatureName: 'FeatureIDE', newFeatureName: 'new feature name'});
    });

    it('does nothing if the new name is the same as the old name', () => {
        const wrapper = shallow(featureRenameDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'FeatureIDE');
        expect(onRenameFeature).not.toBeCalled();
    });
});