import React from 'react';
import {shallow} from 'enzyme';
import FeatureContextualMenu from './FeatureContextualMenu';
import {defaultSettings} from '../../store/settings';
import FeatureModel from '../../modeling/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';
import {FeatureDiagramLayoutType} from '../../types';

describe('FeatureContextualMenu', () => {
    const featureContextualMenu = (selectedFeatureIDs: string[] = []) => {
        const featureModel = FeatureModel.fromKernel(validFeatureModel),
            mock = jest.fn();
        featureModel.hasElement = jest.fn().mockReturnValue(true);
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>',
            getBoundingClientRect: () => ({x: 10, y: 10, width: 100, height: 100})
        });
        return shallow(
            <FeatureContextualMenu
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={FeatureDiagramLayoutType.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onDeselectAllFeatures={mock}
                onCollapseFeatures={mock}
                onExpandFeatures={mock}
                onCollapseFeaturesBelow={mock}
                onExpandFeaturesBelow={mock}
                featureModel={featureModel}
                isSelectMultipleFeatures={selectedFeatureIDs.length > 0}
                selectedFeatureIDs={selectedFeatureIDs}
                onCreateFeatureAbove={mock}
                onCreateFeatureBelow={mock}
                onRemoveFeature={mock}
                onRemoveFeatureSubtree={mock}
                onSetFeatureAbstract={mock}
                onSetFeatureAlternative={mock}
                onSetFeatureAnd={mock}
                onSetFeatureHidden={mock}
                onSetFeatureOptional={mock}
                onSetFeatureOr={mock}
                featureID="FeatureIDE"/>
        );
    };

    beforeAll(() => {
        FeatureModel.getSvg = jest.fn(() => ({
            getBoundingClientRect: () => ({x: 0, y: 0, width: 1000, height: 1000})
        }));
    });

    it('renders correctly for a single feature', () => {
        const wrapper = featureContextualMenu();
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });

    it('renders correctly for a selection of features', () => {
        const wrapper = featureContextualMenu(['FeatureIDE', 'Eclipse']);
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });

    it('switches direction depending on the layout', () => {
        const wrapper = featureContextualMenu();
        expect(wrapper.find(ContextualMenu).prop('directionalHint')).toBe(DirectionalHint.bottomCenter);
        wrapper.setProps({featureDiagramLayout: FeatureDiagramLayoutType.horizontalTree});
        expect(wrapper.find(ContextualMenu).prop('directionalHint')).toBe(DirectionalHint.rightCenter);
    });
});