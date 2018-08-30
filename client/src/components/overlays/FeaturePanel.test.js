import React from 'react';
import {shallow} from 'enzyme';
import FeaturePanel from './FeaturePanel';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {Panel} from 'office-ui-fabric-react/lib/Panel';

describe('FeaturePanel', () => {
    it('renders information for a feature', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn(),
            wrapper = shallow(
                <FeaturePanel
                    isOpen={true}
                    onDismissed={mock}
                    onShowOverlay={mock}
                    onCollapseFeature={mock}
                    onExpandFeature={mock}
                    featureModel={featureModel}
                    featureName="FeatureIDE"/>
            ),
            headerText = shallow(wrapper.find(Panel).prop('headerText'));
        expect(headerText.contains('FeatureIDE')).toBe(true);
        expect(wrapper.find(Panel).contains('A sample description')).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });
});