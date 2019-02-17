import reducer from './reducer';
import actions from './actions';
import {FeatureDiagramLayoutType, OverlayType, MessageType} from '../types';
import {defaultSettings} from './settings';
import {validFeatureModel} from '../fixtures';
import FeatureModel from '../modeling/FeatureModel';
import {initialState, FeatureDiagramCollaborativeSession, State} from './types';
import logger from '../helpers/logger';

jest.mock('../helpers/logger');
jest.mock('../modeling/Kernel');

describe('reducer', () => {
    const artifactPath = {project: 'project', artifact: 'artifact'},
        kernelFeatureModelState = (state = reducer(), kernelFeatureModel = validFeatureModel) => ({
                ...state,
                collaborativeSessions: <FeatureDiagramCollaborativeSession[]>[{
                    artifactPath,
                    collaborators: [],
                    layout: FeatureDiagramLayoutType.horizontalTree,
                    isSelectMultipleFeatures: false,
                    collapsedFeatureIDs: [],
                    selectedFeatureIDs: [],
                    kernelFeatureModel: kernelFeatureModel,
                    kernelContext: {} // assume no kernel in the unit tests
                }],
                currentArtifactPath: artifactPath
            });

    it('returns the initial state', () => {
        expect(reducer()).toBe(initialState);
    });

    describe('settings', () => {
        it('sets a setting', () => {
            const state = reducer(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(state.settings.featureDiagram.font.size).toBe(42);
        });

        it('resets settings to defaults', () => {
            let state = reducer(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(state.settings.featureDiagram.font.size).toBe(42);
            state = reducer(state, actions.settings.reset());
            expect(state.settings).toEqual(defaultSettings);
        });
    });

    describe('user interface', () => {
        it('sets the feature diagram layout', () => {
            let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.setLayout({layout: FeatureDiagramLayoutType.horizontalTree}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).layout).toEqual(FeatureDiagramLayoutType.horizontalTree);
            state = reducer(state, actions.ui.featureDiagram.setLayout({layout: FeatureDiagramLayoutType.verticalTree}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).layout).toEqual(FeatureDiagramLayoutType.verticalTree);
        });

        describe('feature', () => {
            it('is selected', () => {
                const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
            });

            it('is not selected multiple times', () => {
                let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is deselected', () => {
                let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureIDE');
            });

            it('disables multiple feature selection when the last feature is deselected', () => {
                let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureID: 'Eclipse'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(true);
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureID: 'FeatureIDE'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(true);
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureID: 'Eclipse'}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(false);
            });

            it('is collapsed', () => {
                const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs).toContain('FeatureIDE');
            });

            it('is not collapsed multiple times', () => {
                let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducer(state, actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is expanded', () => {
                let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs).toContain('FeatureIDE');
                state = reducer(state, actions.ui.featureDiagram.feature.expand({featureIDs: ['FeatureIDE']}));
                expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs).not.toContain('FeatureIDE');
            });
        });

        describe('multiple features', () => {
            describe('multiple feature selection', () => {
                it('sets whether multiple features can be selected', () => {
                    const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(true);
                });

                it('resets selected features when multiple feature selection is enabled', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                    state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureIDE');
                });

                it('resets selected features when multiple feature selection is disabled', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                    state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: false}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureIDE');
                });
            });

            describe('select all features', () => {
                it('selects all visibile features', () => {
                    const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs)
                        .toEqual(FeatureModel.fromKernel(validFeatureModel).getVisibleFeatureIDs());
                });

                it('does not select features of collapsed children', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                    state = reducer(state, actions.ui.featureDiagram.feature.selectAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureHouse');
                });

                it('enables multiple feature selection', () => {
                    const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(true);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.selectAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('deselect all features', () => {
                it('deselects all features', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toHaveLength(1);
                    state = reducer(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toHaveLength(0);
                });

                it('disables multiple feature selection', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(true);
                    state = reducer(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).isSelectMultipleFeatures).toBe(false);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('collapse all features', () => {
                it('collapses all features with actual children', () => {
                    const state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs)
                        .toEqual(FeatureModel.fromKernel(validFeatureModel).getFeatureIDsWithActualChildren());
                });

                it('does not collapse leaf features', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureHouse');
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.collapseAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('expand all features', () => {
                it('expands all features', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.collapse({featureIDs: ['FeatureIDE']}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs).toHaveLength(1);
                    state = reducer(state, actions.ui.featureDiagram.feature.expandAll());
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collapsedFeatureIDs).toHaveLength(0);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.expandAll());
                    expect(state).toEqual(initialState);
                });
            });
        });

        describe('overlay', () => {
            describe('show overlay', () => {
                it('shows the about panel', () => {
                    const state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.overlayProps).toEqual({});
                });
    
                it('shows a feature callout', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureID: 'FeatureIDE'}}));
                    expect(state.overlay).toBe(OverlayType.featureCallout);
                    expect(state.overlayProps).toEqual({featureID: 'FeatureIDE'});
                });

                it('selects a feature if specified', () => {
                    let state: State = kernelFeatureModelState();
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureID: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}));
                    expect(state.overlay).toBe(OverlayType.featureCallout);
                    expect(state.overlayProps).toEqual({featureID: 'FeatureIDE'});
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                });
            });

            describe('hide overlay', () => {
                it('hides an overlay after showing it', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.overlayProps).toEqual({});
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.aboutPanel}));
                    expect(state.overlay).toBe(OverlayType.none);
                    expect(state.overlayProps).toEqual({});
                });

                it('does nothing if the currently shown overlay is of another type', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.overlayProps).toEqual({});
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featurePanel}));
                    expect(state.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.overlayProps).toEqual({});
                });

                it('deselects a feature when switching from a feature callout or ' +
                    'contextual menu in single feature selection mode', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureID: 'FeatureIDE'}}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featureCallout}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).not.toContain('FeatureIDE');
                });
    
                it('does not deselect a feature in multiple feature selection mode', () => {
                    let state = reducer(kernelFeatureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    state = reducer(state, actions.ui.featureDiagram.feature.select({featureID: 'FeatureIDE'}));
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureID: 'FeatureIDE'}}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featureCallout}));
                    expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).selectedFeatureIDs).toContain('FeatureIDE');
                });
            });
        });
    });

    describe('server', () => {
        it('does not process messages with invalid type', () => {
            expect(reducer(undefined, actions.server.receive({type: 'invalid message type'} as any))).toBe(initialState);
        });
    
        it('warns on errors', () => {
            (logger.warnTagged as any).mockReset();
            expect(logger.warnTagged).not.toBeCalled();
            expect(reducer(undefined, actions.server.receive({type: MessageType.ERROR,error: 'some error'}))).toBe(initialState);
            expect(logger.warnTagged).toBeCalled();
        });
    
        // TODO: track current users not only in the kernel
        /*it('lets users join', () => {
            const state = reducer(kernelFeatureModelState(), actions.server.receive({type: MessageType.JOIN_REQUEST, artifactPath, collaborator: {siteID: 'some ID'}}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collaborators).toContainEqual({siteID: 'some ID'});
        });
    
        it('does not let users join multiple times', () => {
            let state = reducer(kernelFeatureModelState(), actions.server.receive({type: MessageType.JOIN_REQUEST, artifactPath, collaborator: {siteID: 'some ID'}}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collaborators).toHaveLength(1);
            state = reducer(state, actions.server.receive({type: MessageType.JOIN_REQUEST, artifactPath, collaborator: {siteID: 'some ID'}}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collaborators).toHaveLength(1);
        });
    
        it('lets users leave', () => {
            let state = reducer(kernelFeatureModelState(), actions.server.receive({type: MessageType.JOIN_REQUEST, artifactPath, collaborator: {siteID: 'some ID'}}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collaborators).toContainEqual({siteID: 'some ID'});
            state = reducer(kernelFeatureModelState(), actions.server.receive({type: MessageType.LEAVE_REQUEST, artifactPath, collaborator: {siteID: 'some ID'}}));
            expect((<FeatureDiagramCollaborativeSession>state.collaborativeSessions[0]).collaborators).not.toContainEqual({siteID: 'some ID'});
        });*/
    });
});