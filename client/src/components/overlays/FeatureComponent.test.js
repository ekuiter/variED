import React from 'react';
import {shallow} from 'enzyme';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {defaultSettings} from '../../store/settings';
import getFeatureComponent from './FeatureComponent';

describe('FeatureComponent', () => {
    it('renders information for a feature', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn(),
            FeatureComponent = getFeatureComponent(),
            renderIfFeature = FeatureComponent.prototype.renderIfFeature =
            jest.fn(feature => <span>{feature.name}</span>),
            wrapper = shallow(
                <FeatureComponent
                    isOpen={true}
                    onDismiss={mock}
                    settings={defaultSettings}
                    featureModel={featureModel}
                    featureName="FeatureIDE"/>
            );
        expect(renderIfFeature).toBeCalled();
        expect(wrapper.contains('FeatureIDE')).toBe(true);
    });

    it('renders nothing for an invalid feature', () => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn(),
            FeatureComponent = getFeatureComponent(),
            renderIfFeature = FeatureComponent.prototype.renderIfFeature = jest.fn(),
            wrapper = shallow(
                <FeatureComponent
                    isOpen={true}
                    onDismiss={mock}
                    settings={defaultSettings}
                    featureModel={featureModel}
                    featureName="<invalid feature>"/>
            );
        expect(renderIfFeature).not.toBeCalled();
        expect(wrapper.get(0)).toBeNull();
    });
});