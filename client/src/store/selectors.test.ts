import {getCurrentFeatureModel} from './selectors';
import {validFeatureModel, invalidFeatureModel1} from '../fixtures';
import FeatureModel from '../modeling/FeatureModel';
import {initialState} from './types';

describe('selectors', () => {
    describe('getCurrentFeatureModel', () => {
        it('gets no feature model from the initial store state', () => {
            expect(getCurrentFeatureModel(initialState)).toBeUndefined();
        });

        it('gets a feature model from a loaded store state', () => {
            const state = <any>{
                collaborativeSessions: [{
                    artifactPath: {project: 'project', artifact: 'artifact'},
                    serializedFeatureModel: validFeatureModel,
                    collapsedFeatureUUIDs: []
                }],
                currentArtifactPath: {project: 'project', artifact: 'artifact'}
            };
            expect(getCurrentFeatureModel(state)!.serializedFeatureModel)
                .toEqual(FeatureModel.fromJSON(validFeatureModel).toJSON());
        });

        it('recomputes when the store state changes', () => {
            const collaborativeSessions = [{
                    artifactPath: {project: 'project', artifact: 'artifact'},
                    serializedFeatureModel: invalidFeatureModel1,
                    collapsedFeatureUUIDs: ['test1']
                }],
                currentArtifactPath = {project: 'project', artifact: 'artifact'};
                getCurrentFeatureModel.resetRecomputations();

            let state: any = {collaborativeSessions, currentArtifactPath};
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(1);

            state = {collaborativeSessions, currentArtifactPath};
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(1);

            state = {collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureUUIDs: ['test1']
            }];
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(2);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [state.collaborativeSessions[0]];
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(2);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureUUIDs: []
            }];
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(3);

            state = {collaborativeSessions: state.collaborativeSessions, currentArtifactPath};
            state.collaborativeSessions = [{
                artifactPath: {project: 'project', artifact: 'artifact'},
                serializedFeatureModel: validFeatureModel,
                collapsedFeatureUUIDs: state.collaborativeSessions[0].collapsedFeatureUUIDs
            }];
            getCurrentFeatureModel(state);
            expect(getCurrentFeatureModel.recomputations()).toBe(3);
        });
    });
});