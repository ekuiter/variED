import {getCurrentGraphicalFeatureModel} from './selectors';
import {validFeatureModel, invalidFeatureModel1} from '../fixtures';
import GraphicalFeatureModel from '../modeling/GraphicalFeatureModel';
import {initialState} from './types';

describe('selectors', () => {
    describe('getCurrentGraphicalFeatureModel', () => {
        it('gets no feature model from the initial store state', () => {
            expect(getCurrentGraphicalFeatureModel(initialState)).toBeUndefined();
        });

        it('gets a feature model from a loaded store state', () => {
            const state = <any>{
                collaborativeSessions: [{
                    artifactPath: {project: 'project', artifact: 'artifact'},
                    serializedFeatureModel: validFeatureModel,
                    collapsedFeatureNames: []
                }],
                currentArtifactPath: {project: 'project', artifact: 'artifact'}
            };
            expect(getCurrentGraphicalFeatureModel(state)!.serializedFeatureModel)
                .toEqual(GraphicalFeatureModel.fromJSON(validFeatureModel).serializedFeatureModel);
        });

        it('recomputes when the store state changes', () => {
            const collaborativeSessions = [{
                    artifactPath: {project: 'project', artifact: 'artifact'},
                    serializedFeatureModel: invalidFeatureModel1,
                    collapsedFeatureNames: ['test1']
                }],
                currentArtifactPath = {project: 'project', artifact: 'artifact'};
                getCurrentGraphicalFeatureModel.resetRecomputations();

            let state: any = {collaborativeSessions, currentArtifactPath};
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(1);

            state = {collaborativeSessions, currentArtifactPath};
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(1);

            state = {collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureNames: ['test1']
            }];
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(2);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [state.collaborativeSessions[0]];
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(2);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureNames: []
            }];
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(3);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureNames: state.collaborativeSessions[0].collapsedFeatureNames
            }];
            getCurrentGraphicalFeatureModel(state);
            expect(getCurrentGraphicalFeatureModel.recomputations()).toBe(3);
        });
    });
});