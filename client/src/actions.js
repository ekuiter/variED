import messageActions from './server/messageActions';

export default {
    server: messageActions,
    ui: {
        toggleDebug: () => ({type: 'UI_TOGGLE_DEBUG'}),
        toggleUseTransitions: () => ({type: 'UI_TOGGLE_USE_TRANSITIONS'}),
        setLayout: layout => ({type: 'UI_SET_LAYOUT', layout})
    }
};