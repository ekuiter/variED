import React from 'react';
import {shallow} from 'enzyme';
import FeatureContextualMenu from './FeatureContextualMenu';
import {layoutTypes} from '../../types';
import {defaultSettings} from '../../store/settings';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';

describe('FeatureContextualMenu', () => {
    it('renders correctly for a single feature', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>'
        });
        const wrapper = shallow(
            <FeatureContextualMenu
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={layoutTypes.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onSelectAllFeatures={mock}
                onDeselectAllFeatures={mock}
                onCollapseFeature={mock}
                onExpandFeature={mock}
                featureModel={featureModel}
                isSelectMultipleFeatures={false}
                selectedFeatureNames={[]}
                featureName="FeatureIDE"/>
        );
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });

    it('renders correctly for a selection of features', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureModel.getElement = jest.fn().mockReturnValue({
            querySelector: () => '<target element>'
        });
        const wrapper = shallow(
            <FeatureContextualMenu
                isOpen={true}
                onDismiss={mock}
                featureDiagramLayout={layoutTypes.verticalTree}
                settings={defaultSettings}
                onShowOverlay={mock}
                onSelectAllFeatures={mock}
                onDeselectAllFeatures={mock}
                onCollapseFeature={mock}
                onExpandFeature={mock}
                featureModel={featureModel}
                isSelectMultipleFeatures={true}
                selectedFeatureNames={['FeatureIDE', 'Eclipse']}
                featureName="FeatureIDE"/>
        );
        expect(wrapper.prop('target')).toBe('<target element>');
        expect(wrapper).toMatchSnapshot();
    });
});