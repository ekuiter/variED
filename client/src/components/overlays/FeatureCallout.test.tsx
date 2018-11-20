import React from 'react';
import {shallow} from 'enzyme';
import FeatureCallout from './FeatureCallout';
import GraphicalFeatureModel from '../../modeling/GraphicalFeatureModel';
import {validFeatureModel} from '../../fixtures';
import {defaultSettings} from '../../store/settings';
import {Callout, DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {FeatureDiagramLayoutType} from '../../types';

describe('FeatureCallout', () => {
    const featureCallout = (featureUUID = 'FeatureIDE') => {
        const graphicalFeatureModel = GraphicalFeatureModel.fromJSON(validFeatureModel),
            mock = jest.fn();
        graphicalFeatureModel.hasElement = jest.fn().mockReturnValue(true);
        graphicalFeatureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>',
            getBoundingClientRect: () => ({x: 10, y: 10, width: 100, height: 100})
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
                graphicalFeatureModel={graphicalFeatureModel}
                featureUUID={featureUUID}
                onRemoveFeatures={mock}
                onAddFeatureAbove={mock}
                onAddFeatureBelow={mock}
                onRemoveFeaturesBelow={mock}/>
        );
    };

    beforeAll(() => {
        GraphicalFeatureModel.getSvg = jest.fn(() => ({
            getBoundingClientRect: () => ({x: 0, y: 0, width: 1000, height: 1000})
        }));
    });

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