import React from 'react';
import {shallow} from 'enzyme';
import FeatureRenameDialog from './FeatureRenameDialog';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import actions from '../../store/actions';
import { defaultSettings } from '../../store/settings';

jest.mock('../../store/actions');

describe('FeatureRenameDialog', () => {
    let featureRenameDialog: JSX.Element;

    beforeEach(() => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureRenameDialog = (
            <FeatureRenameDialog
                isOpen={true}
                featureModel={featureModel}
                featureName="FeatureIDE"
                settings={defaultSettings}/>
        );
    });

    it('renders a dialog for renaming a feature', () => {
        const wrapper = shallow(featureRenameDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('FeatureIDE');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureRenameDialog);
        actions.server.featureDiagram.feature.rename.mockClear();
        wrapper.find(TextFieldDialog).simulate('submit', 'new feature name');
        expect(actions.server.featureDiagram.feature.rename).lastCalledWith('FeatureIDE', 'new feature name');
    });

    it('does nothing if the new name is the same as the old name', () => {
        const wrapper = shallow(featureRenameDialog);
        actions.server.featureDiagram.feature.rename.mockClear();
        wrapper.find(TextFieldDialog).simulate('submit', 'FeatureIDE');
        expect(actions.server.featureDiagram.feature.rename).not.toBeCalled();
    });
});