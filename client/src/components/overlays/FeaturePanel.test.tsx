import React from 'react';
import {shallow} from 'enzyme';
import FeaturePanel from './FeaturePanel';
import FeatureModel from '../../modeling/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {Panel} from 'office-ui-fabric-react/lib/Panel';
import i18n from '../../i18n';
import {defaultSettings} from '../../store/settings';

describe('FeaturePanel', () => {
    const featurePanel = (featureID = 'FeatureIDE') => {
        const featureModel = FeatureModel.fromJSON(validFeatureModel),
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
                featureID={featureID}
                settings={defaultSettings}
                onAddFeatureAbove={mock}
                onAddFeatureBelow={mock}
                onRemoveFeatures={mock}
                onRemoveFeaturesBelow={mock}
                onSetFeatureAbstract={mock}
                onSetFeatureAlternative={mock}
                onSetFeatureAnd={mock}
                onSetFeatureHidden={mock}
                onSetFeatureOptional={mock}
                onSetFeatureOr={mock}/>
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