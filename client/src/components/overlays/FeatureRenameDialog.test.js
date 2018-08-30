import React from 'react';
import {shallow} from 'enzyme';
import FeatureRenameDialog from './FeatureRenameDialog';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import actions from '../../store/actions';

jest.mock('../../store/actions');

describe('FeatureRenameDialog', () => {
    let featureRenameDialog;

    beforeEach(() => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureRenameDialog = (
            <FeatureRenameDialog
                isOpen={true}
                onDismiss={mock}
                featureModel={featureModel}
                featureName="FeatureIDE"/>
        );
    });

    it('renders a dialog for renaming a feature', () => {
        const wrapper = shallow(featureRenameDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('FeatureIDE');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureRenameDialog);
        wrapper.find(TextFieldDialog).simulate('submit', 'new feature name');
        expect(actions.server.feature.rename).toHaveBeenCalledWith('FeatureIDE', 'new feature name');
    });
});