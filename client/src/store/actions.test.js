import actions from './actions';
import {layoutTypes, overlayTypes} from '../types';

describe('actions', () => {
    describe('settings', () => {
        it('sets a setting', () => {
            expect(actions.settings.set('featureDiagram.font.size', 42))
                .toEqual({type: 'SETTINGS/SET', payload: {path: 'featureDiagram.font.size', value: 42}});
        });

        it('resets settings to defaults', () => {
            expect(actions.settings.reset()).toEqual({type: 'SETTINGS/RESET'});
        });
    });

    describe('user interface', () => {
        it('sets the feature diagram layout', () => {
            expect(actions.ui.setFeatureDiagramLayout(layoutTypes.verticalTree))
                .toEqual({type: 'UI/SET_FEATURE_DIAGRAM_LAYOUT', payload: {featureDiagramLayout: layoutTypes.verticalTree}});
        });

        describe('feature', () => {
            it('is selected', () => {
                expect(actions.ui.feature.select('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE/SELECT', payload: {featureName: 'FeatureIDE'}});
            });

            it('is deselected', () => {
                expect(actions.ui.feature.deselect('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE/DESELECT', payload: {featureName: 'FeatureIDE'}});
            });

            it('is collapsed', () => {
                expect(actions.ui.feature.collapse('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE/COLLAPSE', payload: {featureName: 'FeatureIDE'}});
            });

            it('is expanded', () => {
                expect(actions.ui.feature.expand('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE/EXPAND', payload: {featureName: 'FeatureIDE'}});
            });
        });

        describe('multiple features', () => {
            it('sets whether multiple features can be selected', () => {
                expect(actions.ui.features.setSelectMultiple(true))
                    .toEqual({type: 'UI/FEATURES/SET_SELECT_MULTIPLE', payload: {isSelectMultipleFeatures: true}});
            });

            it('selects all', () => {
                expect(actions.ui.features.selectAll())
                    .toEqual({type: 'UI/FEATURES/SELECT_ALL'});
            });

            it('deselects all', () => {
                expect(actions.ui.features.deselectAll())
                    .toEqual({type: 'UI/FEATURES/DESELECT_ALL'});
            });

            it('collapses all', () => {
                expect(actions.ui.features.collapseAll())
                    .toEqual({type: 'UI/FEATURES/COLLAPSE_ALL'});
            });

            it('expands all', () => {
                expect(actions.ui.features.expandAll())
                    .toEqual({type: 'UI/FEATURES/EXPAND_ALL'});
            });
        });

        describe('overlay', () => {
            it('shows the about panel', () => {
                expect(actions.ui.overlay.show(overlayTypes.aboutPanel))
                    .toEqual({
                        type: 'UI/OVERLAY/SHOW', payload: {
                            overlay: overlayTypes.aboutPanel, overlayProps: undefined, selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel', () => {
                expect(actions.ui.overlay.show(overlayTypes.featurePanel, {featureName: 'FeatureIDE'}))
                    .toEqual({
                        type: 'UI/OVERLAY/SHOW', payload: {
                            overlay: overlayTypes.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel and selects a feature', () => {
                expect(actions.ui.overlay.show(overlayTypes.featurePanel, {featureName: 'FeatureIDE'}, {selectFeature: 'FeatureIDE'}))
                    .toEqual({
                        type: 'UI/OVERLAY/SHOW', payload: {
                            overlay: overlayTypes.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectFeature: 'FeatureIDE'
                        }
                    });
            });

            it('hides a panel', () => {
                expect(actions.ui.overlay.hide(overlayTypes.aboutPanel))
                    .toEqual({type: 'UI/OVERLAY/HIDE', payload: {overlay: overlayTypes.aboutPanel}});
            });
        });
    });
});