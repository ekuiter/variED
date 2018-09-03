import React from 'react';
import {shallow} from 'enzyme';
import FeatureContextualMenu from './FeatureContextualMenu';
import {layoutTypes} from '../../types';
import {defaultSettings} from '../../store/settings';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {ContextualMenu} from 'office-ui-fabric-react/lib/ContextualMenu';
import {DirectionalHint} from 'office-ui-fabric-react/lib/Callout';

describe('FeatureContextualMenu', () => {
    const featureContextualMenu = (selectedFeatureNames = []) => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>'
        });
        return shallow(
            <FeatureContextualMenu
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={layoutTypes.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onDeselectAllFeatures={mock}
                onCollapseFeature={mock}
                onExpandFeature={mock}
                featureModel={featureModel}
                isSelectMultipleFeatures={selectedFeatureNames.length > 0}
                selectedFeatureNames={selectedFeatureNames}
                featureName="FeatureIDE"/>
        );
    };

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
        wrapper.setProps({featureDiagramLayout: layoutTypes.horizontalTree});
        expect(wrapper.find(ContextualMenu).prop('directionalHint')).toBe(DirectionalHint.rightCenter);
    });
});