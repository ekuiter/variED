import React from 'react';
import {shallow} from 'enzyme';
import FeatureSetDescriptionDialog from './FeatureSetDescriptionDialog';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import actions from '../../store/actions';
import { defaultSettings } from '../../store/settings';

jest.mock('../../store/actions');

describe('FeatureSetDescriptionDialog', () => {
    let featureSetDescriptionDialog: JSX.Element;

    beforeEach(() => {
        featureSetDescriptionDialog = (
            <FeatureSetDescriptionDialog
                isOpen={true}
                featureModel={new FeatureModel(validFeatureModel, [])}
                featureName="FeatureIDE"
                settings={defaultSettings}/>
        );
    });

    it('renders a dialog for setting a feature\'s description', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('A sample description');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        (actions.server.featureDiagram.feature.setDescription as jest.Mock).mockClear();
        wrapper.find(TextFieldDialog).simulate('submit', 'new description');
        expect(actions.server.featureDiagram.feature.setDescription).lastCalledWith({featureName: 'FeatureIDE', description: 'new description'});
    });
});