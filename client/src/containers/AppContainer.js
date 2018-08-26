import React from 'react';
import {openWebSocket} from '../server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import contextualMenuItems from '../components/contextualMenuItems';
import actions from '../store/actions';
import OverlayContainer from './overlays/OverlayContainer';
import withKeys from '../helpers/withKeys';
import defer from '../helpers/defer';
import UserFacepile from '../components/UserFacepile';
import {getFeatureModel} from '../store/selectors';

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
                            contextualMenuItems.featureDiagram.selection(
                                this.props.isSelectMultipleFeatures,
                                this.props.onSetSelectMultipleFeatures,
                                this.props.selectedFeatureNames,
                                this.props.onSelectAllFeatures,
                                this.props.onDeselectAllFeatures,
                                this.props.featureModel)
                        ]}
                        farItems={[
                            {
                                key: 'userFacepile',
                                onRender: () =>
                                    <UserFacepile
                                        users={this.props.users}
                                        settings={this.props.settings}/>
                            },
                            contextualMenuItems.settings(this.props.onShowOverlay),
                            contextualMenuItems.about(this.props.onShowOverlay)
                        ]}/>
                </div>
                <FeatureDiagramContainer className="content"/>
                <OverlayContainer/>
            </Fabric>
        );
    }
}

export default connect(
    state => ({
        featureDiagramLayout: state.ui.featureDiagramLayout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        users: state.server.users,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        handleMessage: dispatch,
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.setFeatureDiagramLayout(layout)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.setSelectMultipleFeatures(isSelectMultipleFeatures)),
        onSelectAllFeatures: () => dispatch(actions.ui.selectAllFeatures()),
        onDeselectAllFeatures: () => dispatch(actions.ui.deselectAllFeatures()),
        onShowOverlay: (...args) => dispatch(actions.ui.showOverlay(...args))
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
