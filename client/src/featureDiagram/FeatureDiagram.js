import React from 'react';
import VerticalTreeLayout from './treeLayout/VerticalTreeLayout';
import HorizontalTreeLayout from './treeLayout/HorizontalTreeLayout';
import {getSetting} from '../settings';

class FeatureDiagram extends React.Component {
    static defaultProps = {layout: 'verticalTree'};

    static layoutMap = {
        verticalTree: VerticalTreeLayout,
        horizontalTree: HorizontalTreeLayout
    };

    layoutRef = React.createRef();

    key({settings}) {
        // The key uniquely identifies the layout component instance. If the key changes, the
        // instance is unmounted and a new one is mounted. This is useful for forcing rerenders.
        const keyProperties = [],
            addKeyProperty = path => keyProperties.push(getSetting(settings, path));

        addKeyProperty('featureDiagram.font.family');
        addKeyProperty('featureDiagram.font.size');

        if (this.props.layout === 'verticalTree' || this.props.layout === 'horizontalTree')
            addKeyProperty('featureDiagram.treeLayout.debug');

        return JSON.stringify(keyProperties);
    }

    render() {
        const {layout, ...props} = this.props,
            LayoutComponent = FeatureDiagram.layoutMap[layout];
        return (
            <LayoutComponent key={this.key(props)} ref={this.layoutRef} {...props} />
        );
    }

    export() {
        const layout = this.layoutRef.current;
        if (layout && layout.canExport())
            return layout.export().then(console.log);
        else
            return Promise.reject('can not export feature diagram');
    }
}

export default FeatureDiagram;