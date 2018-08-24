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
import withKeys from '../helpers/withKeys';
import defer from '../helpers/defer';
import EndpointFacepile from '../components/EndpointFacepile';

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
                            contextualMenuItems.featureDiagram.undo(this.props.undoChecked),
                            contextualMenuItems.featureDiagram.redo(this.props.redoChecked)
                        ]}
                        overflowItems={[
                            contextualMenuItems.featureDiagram.setLayout(
                                this.props.featureDiagramLayout,
                                this.props.onSetFeatureDiagramLayout),
                            contextualMenuItems.featureDiagram.setSelectMultiple(
                                this.props.isSelectMultiple,
                                this.props.onSetSelectMultiple)
                        ]}
                        farItems={[
                            {
                                key: 'endpointFacepile',
                                onRender: () =>
                                    <EndpointFacepile
                                        endpoints={this.props.endpoints}
                                        settings={this.props.settings}/>
                            },
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
        featureDiagramLayout: state.ui.featureDiagramLayout,
        isSelectMultiple: state.ui.isSelectMultiple,
        endpoints: state.server.endpoints,
        settings: state.settings
    }),
    dispatch => ({
        handleMessage: dispatch,
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.setFeatureDiagramLayout(layout)),
        onSetSelectMultiple: isSelectMultiple => dispatch(actions.ui.setSelectMultiple(isSelectMultiple)),
        onShowPanel: (panel, panelProps) => dispatch(actions.ui.showPanel(panel, panelProps))
    })
)(withKeys({
    key: ({event}) => event.isCommand('z'),
    injectProp: {prop: 'undoChecked', value: true},
    action: ({injectProp}) => actions.server.undo().then(defer(() => injectProp('undoChecked', false)))
}, {
    key: ({event}) => event.isCommand('y') || event.isShiftCommand('z'),
    injectProp: {prop: 'redoChecked', value: true},
    action: ({injectProp}) => actions.server.redo().then(defer(() => injectProp('redoChecked', false)))
})(AppContainer));
