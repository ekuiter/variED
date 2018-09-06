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
            expect(actions.ui.featureDiagram.setLayout(layoutTypes.verticalTree))
                .toEqual({type: 'UI/FEATURE_DIAGRAM/SET_LAYOUT', payload: {layout: layoutTypes.verticalTree}});
        });

        describe('feature', () => {
            it('is selected', () => {
                expect(actions.ui.featureDiagram.feature.select('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/SELECT', payload: {featureName: 'FeatureIDE'}});
            });

            it('is deselected', () => {
                expect(actions.ui.featureDiagram.feature.deselect('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/DESELECT', payload: {featureName: 'FeatureIDE'}});
            });

            it('is collapsed', () => {
                expect(actions.ui.featureDiagram.feature.collapse('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/COLLAPSE', payload: {featureName: 'FeatureIDE'}});
            });

            it('is expanded', () => {
                expect(actions.ui.featureDiagram.feature.expand('FeatureIDE'))
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/EXPAND', payload: {featureName: 'FeatureIDE'}});
            });
        });

        describe('multiple features', () => {
            it('sets whether multiple features can be selected', () => {
                expect(actions.ui.featureDiagram.feature.setSelectMultiple(true))
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/SET_SELECT_MULTIPLE', payload: {isSelectMultipleFeatures: true}});
            });

            it('selects all', () => {
                expect(actions.ui.featureDiagram.feature.selectAll())
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/SELECT_ALL'});
            });

            it('deselects all', () => {
                expect(actions.ui.featureDiagram.feature.deselectAll())
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/DESELECT_ALL'});
            });

            it('collapses all', () => {
                expect(actions.ui.featureDiagram.feature.collapseAll())
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/COLLAPSE_ALL'});
            });

            it('expands all', () => {
                expect(actions.ui.featureDiagram.feature.expandAll())
                    .toEqual({type: 'UI/FEATURE_DIAGRAM/FEATURE/EXPAND_ALL'});
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
                expect(actions.ui.overlay.show(overlayTypes.featurePanel, {featureName: 'FeatureIDE'}, {selectOneFeature: 'FeatureIDE'}))
                    .toEqual({
                        type: 'UI/OVERLAY/SHOW', payload: {
                            overlay: overlayTypes.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectOneFeature: 'FeatureIDE'
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