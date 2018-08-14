import React from 'react';
import VerticalTreeLayout from './treeLayout/VerticalTreeLayout';
import HorizontalTreeLayout from './treeLayout/HorizontalTreeLayout';

class FeatureModel extends React.Component {
    static defaultProps = {layout: 'verticalTree'};

    static layoutMap = {
        verticalTree: VerticalTreeLayout,
        horizontalTree: HorizontalTreeLayout
    };

    layoutRef = React.createRef();

    render() {
        const {layout, ...props} = this.props,
            LayoutComponent = FeatureModel.layoutMap[layout];

        return (
            <LayoutComponent ref={this.layoutRef} {...props} />
        );
    }

    export() {
        const layout = this.layoutRef.current;
        if (layout && layout.canExport())
            return layout.export().then(console.log);
        else
            return Promise.reject('can not export feature model');
    }
}

export default FeatureModel;