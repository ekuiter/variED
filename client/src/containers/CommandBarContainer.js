import contextualMenuItems from '../components/contextualMenuItems';
import UserFacepile from '../components/UserFacepile';
import {CommandBar} from '../../node_modules/office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import connect from 'react-redux/es/connect/connect';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import withKeys from '../helpers/withKeys';
import defer from '../helpers/defer';

const CommandBarContainer = props => (
    <CommandBar
        items={[
            contextualMenuItems.featureDiagram.undo(props.undoChecked),
            contextualMenuItems.featureDiagram.redo(props.redoChecked)
        ]}
        overflowItems={[
            // Clicking on submenu items of the overflow menu throws
            // "Warning: Can't call setState (or forceUpdate) on an unmounted component".
            // This is a known issue in Office UI Fabric:
            // https://github.com/OfficeDev/office-ui-fabric-react/issues/5433
            // TODO: wait for fix ...
            contextualMenuItems.featureDiagram.setLayout(
                props.featureDiagramLayout,
                props.onSetFeatureDiagramLayout),
            contextualMenuItems.featureDiagram.selection(
                props.isSelectMultipleFeatures,
                props.onSetSelectMultipleFeatures,
                props.selectedFeatureNames,
                props.onSelectAllFeatures,
                props.onDeselectAllFeatures,
                props.featureModel)
        ]}
        farItems={[
            {
                key: 'userFacepile',
                onRender: () =>
                    <UserFacepile
                        users={props.users}
                        settings={props.settings}/>
            },
            contextualMenuItems.settings(props.onShowOverlay),
            contextualMenuItems.about(props.onShowOverlay)
        ]}/>
);

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
})(CommandBarContainer));