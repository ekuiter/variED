import FeatureModel from '../server/FeatureModel';
import {defaultSettings} from './settings';
import {layoutTypes} from '../types';

export interface State {
    server: {
        users: string[],
        featureModel?: FeatureModel
    },
    settings: object,
    ui: {
        featureDiagram: {
            layout: string,
            isSelectMultipleFeatures: boolean,
            selectedFeatureNames: string[],
            collapsedFeatureNames: string[]
        },
        overlay?: string, // TODO
        overlayProps?: object // TODO
    }
};

export const initialState: State = {
    server: {
        users: [],
        featureModel: undefined
    },
    settings: defaultSettings,
    ui: {
        featureDiagram: {
            layout: layoutTypes.verticalTree,
            isSelectMultipleFeatures: false,
            selectedFeatureNames: [],
            collapsedFeatureNames: []
        },
        overlay: undefined,
        overlayProps: undefined
    }
};