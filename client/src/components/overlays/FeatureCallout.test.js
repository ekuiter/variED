import React from 'react';
import {shallow} from 'enzyme';
import FeatureCallout from './FeatureCallout';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {layoutTypes} from '../../types';
import {defaultSettings} from '../../store/settings';
import {Callout} from 'office-ui-fabric-react/lib/Callout';

describe('FeatureCallout', () => {
    it('renders information for a feature', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>'
        });
        const wrapper = shallow(
            <FeatureCallout
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={layoutTypes.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onCollapseFeature={mock}
                onExpandFeature={mock}
                featureModel={featureModel}
                featureName="FeatureIDE"/>
        );
        expect(wrapper.find(Callout).find('.callout .header').contains('FeatureIDE')).toBe(true);
        expect(wrapper.find(Callout).contains('A sample description')).toBe(true);
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });
});