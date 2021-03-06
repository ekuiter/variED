import React from 'react';
import {shallow} from 'enzyme';
import FeatureSetDescriptionDialog from './FeatureSetDescriptionDialog';
import FeatureModel from '../../modeling/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import {defaultSettings} from '../../store/settings';

describe('FeatureSetDescriptionDialog', () => {
    let featureSetDescriptionDialog: JSX.Element, onSetFeatureDescription: jest.Mock;

    beforeEach(() => {
        const mock = jest.fn();
        onSetFeatureDescription = jest.fn();
        featureSetDescriptionDialog = (
            <FeatureSetDescriptionDialog
                isOpen={true}
                onDismiss={mock}
                featureModel={FeatureModel.fromKernel(validFeatureModel)}
                featureID="FeatureIDE"
                settings={defaultSettings}
                onSetFeatureDescription={onSetFeatureDescription}/>
        );
    });

    it('renders a dialog for setting a feature\'s description', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('A sample description');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'new description');
        expect(onSetFeatureDescription).lastCalledWith({featureID: 'FeatureIDE', description: 'new description'});
    });
});