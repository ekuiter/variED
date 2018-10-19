import React from 'react';
import {shallow} from 'enzyme';
import FeatureCallout from './FeatureCallout';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {defaultSettings} from '../../store/settings';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {FeatureDiagramLayoutType} from '../../types';

describe('FeatureCallout', () => {
    const featureCallout = (featureName = 'FeatureIDE') => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>'
        });
        return shallow(
            <FeatureCallout
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={FeatureDiagramLayoutType.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onCollapseFeatures={mock}
                onExpandFeatures={mock}
                onCollapseFeaturesBelow={mock}
                onExpandFeaturesBelow={mock}
                featureModel={featureModel}
                featureName={featureName}/>
        );
    };

    it('renders information for a feature with a description', () => {
        const wrapper = featureCallout();
        expect(wrapper.find(Callout).find('.callout .header').contains('FeatureIDE')).toBe(true);
        expect(wrapper.find(Callout).contains('A sample description')).toBe(true);
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });

    it('renders information for a feature without a description', () => {
        const wrapper = featureCallout('FeatureHouse');
        expect(wrapper.find(Callout).find('.callout .header').contains('FeatureHouse')).toBe(true);
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });

    it('switches direction depending on the layout', () => {
        const wrapper = featureCallout();
        expect(wrapper.find(Callout).prop('directionalHint')).toBe(DirectionalHint.bottomCenter);
        wrapper.setProps({featureDiagramLayout: FeatureDiagramLayoutType.horizontalTree});
        expect(wrapper.find(Callout).prop('directionalHint')).toBe(DirectionalHint.rightCenter);
    });
});