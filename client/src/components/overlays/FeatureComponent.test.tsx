import React from 'react';
import {shallow} from 'enzyme';
import FeatureModel from '../../modeling/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {defaultSettings} from '../../store/settings';
import getFeatureComponent from './FeatureComponent';

describe('FeatureComponent', () => {
    const featureComponent = (
        {featureComponent, featureID = 'FeatureIDE', mockRenderIfFeature = true, onDismiss = jest.fn()}:
        {featureComponent?: object, featureID?: string, mockRenderIfFeature?: boolean, onDismiss?: jest.Mock} = {}) => {
        const featureModel = FeatureModel.fromJSON(validFeatureModel),
            FeatureComponent = getFeatureComponent(featureComponent);
        if (mockRenderIfFeature)
            FeatureComponent.prototype.renderIfFeature =
            jest.fn(feature => <span>{feature.name}</span>);
        return {
            wrapper: shallow(
                <FeatureComponent
                    isOpen={true}
                    onDismiss={onDismiss}
                    settings={defaultSettings}
                    featureModel={featureModel}
                    featureID={featureID}/>
            ),
            renderIfFeature: FeatureComponent.prototype.renderIfFeature
        };
    };

    it('renders information for a feature', () => {
        const {wrapper, renderIfFeature} = featureComponent();
        expect(renderIfFeature).toBeCalled();
        expect(wrapper.contains('FeatureIDE')).toBe(true);
        wrapper.unmount();
    });

    it('renders nothing for an invalid feature', () => {
        const {wrapper, renderIfFeature} = featureComponent({featureID: '<invalid feature>'});
        expect(renderIfFeature).not.toBeCalled();
        expect(wrapper.get(0)).toBeNull();
    });
    
    it('is abstract', () => {
        expect(() => featureComponent({mockRenderIfFeature: false})).toThrow('abstract method not implemented');
    });

    it('forcibly updates regularly', () => {
        jest.useFakeTimers();
        const throttleUpdate = defaultSettings.featureDiagram.overlay.throttleUpdate,
            {wrapper} = featureComponent({featureID: 'FeatureIDE', featureComponent: {doUpdate: true}}),
            forceUpdate = wrapper.instance().forceUpdate = jest.fn();
        expect(typeof (wrapper.instance() as any).interval).toBe('number');
        for (let i = 0; i < 10; i++) {
            expect(forceUpdate).toHaveBeenCalledTimes(i);
            jest.runTimersToTime(throttleUpdate);
        }
        wrapper.unmount();
        for (let i = 0; i < 10; i++) {
            expect(forceUpdate).toHaveBeenCalledTimes(10);
            jest.runTimersToTime(throttleUpdate);
        }
    });
});