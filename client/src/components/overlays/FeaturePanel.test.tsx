import React from 'react';
import {shallow} from 'enzyme';
import FeaturePanel from './FeaturePanel';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {Panel} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';

describe('FeaturePanel', () => {
    const featurePanel = (featureName = 'FeatureIDE') => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        return shallow(
            <FeaturePanel
                isOpen={true}
                onDismissed={mock}
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
        const wrapper = featurePanel(),
            headerText = shallow(wrapper.find(Panel).prop('headerText') as any);
        expect(headerText.contains('FeatureIDE')).toBe(true);
        expect(wrapper.find(Panel).contains('A sample description')).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('renders information for a feature without a description', () => {
        const wrapper = featurePanel('FeatureHouse'),
            headerText = shallow(wrapper.find(Panel).prop('headerText') as any);
        expect(headerText.contains('FeatureHouse')).toBe(true);
        expect(wrapper.find(Panel).contains(i18n.t('overlays.featurePanel.noDescriptionSet'))).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });
    
    it('renders footer content', () => {
        const wrapper = featurePanel(),
            footer = (wrapper.instance() as FeaturePanel).onRenderFooterContent();
        expect(footer.props.items).not.toHaveLength(0);
    });
});