import React from 'react';
import VerticalTreeLayout from './treeLayout/VerticalTreeLayout';
import HorizontalTreeLayout from './treeLayout/HorizontalTreeLayout';
import stringify from 'json-stable-stringify';

class FeatureDiagram extends React.Component {
    static defaultProps = {layout: null};

    static layoutMap = {
        verticalTree: VerticalTreeLayout,
        horizontalTree: HorizontalTreeLayout
    };

    layoutRef = React.createRef();

    getKey({settings}) {
        // The key uniquely identifies the layout component instance. If the key changes, the
        // instance is unmounted and a new one is mounted. This is useful for forcing rerenders.
        return stringify(settings); // For now, just rerender whenever any setting changes.
    }

    render() {
        const {layout, ...props} = this.props,
            LayoutComponent = FeatureDiagram.layoutMap[layout];
        return (
            <LayoutComponent key={this.getKey(props)} ref={this.layoutRef} {...props} />
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