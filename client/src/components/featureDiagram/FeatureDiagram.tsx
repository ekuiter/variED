/**
 * The feature diagram is the visual representation of a feature model.
 * There may be different kinds of feature diagrams, referred to as layouts.
 */

import React from 'react';
import VerticalTreeLayout from './treeLayout/VerticalTreeLayout';
import HorizontalTreeLayout from './treeLayout/HorizontalTreeLayout';
import stringify from 'json-stable-stringify';
import {getSetting, cloneSettings, traverseSettings} from '../../store/settings';
import {FeatureDiagramLayoutType} from '../../types';

const layoutMap = {
    [FeatureDiagramLayoutType.verticalTree]: VerticalTreeLayout,
    [FeatureDiagramLayoutType.horizontalTree]: HorizontalTreeLayout
};

interface Props {
    featureDiagramLayout: FeatureDiagramLayoutType,
    settings: object,
    [x: string]: any
};

export default class extends React.Component<Props> {
    getKey({settings}: {settings: object}): string {
        // The key uniquely identifies the layout component instance. If the key changes, the
        // instance is unmounted and a new one is mounted. This is useful for forcing rerenders.
        const clonedFeatureDiagramSettings = cloneSettings(getSetting(settings, 'featureDiagram')),
            doNotRerenderForPaths: string[] = getSetting(settings, 'featureDiagram.doNotRerenderForPaths');
        traverseSettings(clonedFeatureDiagramSettings, undefined,
            function(this: object, path: string, key: string, _value: any) {
                // filter settings that should not trigger a rerender
                if (doNotRerenderForPaths.includes(path))
                    this[key] = undefined;
            });
        return stringify(clonedFeatureDiagramSettings);
    }

    render(): JSX.Element {
        const {featureDiagramLayout, ...props} = this.props,
            LayoutComponent = layoutMap[featureDiagramLayout];
        return (
            <LayoutComponent key={this.getKey(props)} {...props}/>
        );
    }
}