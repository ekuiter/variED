import React from 'react';
import {openWebSocket} from '../server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import contextualMenuItems from '../components/contextualMenuItems';
import actions from '../store/actions';
import PanelContainer from './panels/PanelContainer';
import DialogContainer from './dialogs/DialogContainer';

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
                            contextualMenuItems.featureDiagram.undo(),
                            contextualMenuItems.featureDiagram.redo(),
                            contextualMenuItems.featureDiagram.setLayout(
                                this.props.featureDiagramLayout,
                                this.props.onSetFeatureDiagramLayout),
                        ]}
                        farItems={[
                            contextualMenuItems.settings(this.props.onShowPanel),
                            contextualMenuItems.about(this.props.onShowPanel)
                        ]}/>
                </div>
                <FeatureDiagramContainer className="content"/>
                <PanelContainer
                    featureDiagramLayout={this.props.featureDiagramLayout}/>
                <DialogContainer/>
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
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.setFeatureDiagramLayout(layout)),
        onShowPanel: (panel, panelProps) => dispatch(actions.ui.showPanel(panel, panelProps))
    })
)(AppContainer);
