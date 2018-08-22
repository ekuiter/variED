import React from 'react';
import {openWebSocket} from './server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import CommandBarItems from './CommandBarItems';
import Actions from './Actions';
import PanelContainer from './PanelContainer';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.handleMessage);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBar
                        items={[
                            CommandBarItems.featureDiagram.undo(),
                            CommandBarItems.featureDiagram.redo(),
                            CommandBarItems.featureDiagram.setLayout(
                                this.props.featureDiagramLayout,
                                this.props.onSetFeatureDiagramLayout),
                        ]}
                        farItems={[
                            CommandBarItems.settings(this.props.onShowPanel),
                            CommandBarItems.about(this.props.onShowPanel)
                        ]}/>
                </div>
                <FeatureDiagramContainer className="content"/>
                <PanelContainer
                    featureDiagramLayout={this.props.featureDiagramLayout}/>
            </Fabric>
        );
    }
}

export default connect(
    state => ({
        featureDiagramLayout: state.ui.featureDiagramLayout
    }),
    dispatch => ({
        handleMessage: dispatch,
        onSetFeatureDiagramLayout: layout => dispatch(Actions.ui.setFeatureDiagramLayout(layout)),
        onShowPanel: (panel, panelProps) => dispatch(Actions.ui.showPanel(panel, panelProps))
    })
)(AppContainer);
