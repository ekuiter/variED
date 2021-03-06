import React from 'react';
import {shallow} from 'enzyme';
import FeatureRenameDialog from './FeatureRenameDialog';
import FeatureModel from '../../modeling/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import {defaultSettings} from '../../store/settings';

describe('FeatureRenameDialog', () => {
    let featureRenameDialog: JSX.Element, onSetFeatureName: jest.Mock;

    beforeEach(() => {
        const mock = jest.fn();
        onSetFeatureName = jest.fn();
        featureRenameDialog = (
            <FeatureRenameDialog
                isOpen={true}
                onDismiss={mock}
                featureModel={FeatureModel.fromKernel(validFeatureModel)}
                featureID="FeatureIDE"
                settings={defaultSettings}
                onSetFeatureName={onSetFeatureName}/>
        );
    });

    it('renders a dialog for renaming a feature', () => {
        const wrapper = shallow(featureRenameDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('FeatureIDE');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureRenameDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'new feature name');
        expect(onSetFeatureName).lastCalledWith({featureID: 'FeatureIDE', name: 'new feature name'});
    });

    it('does nothing if the new name is the same as the old name', () => {
        const wrapper = shallow(featureRenameDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'FeatureIDE');
        expect(onSetFeatureName).not.toBeCalled();
    });
});