export default {
    ui: {
        toggleDebug: () => ({type: 'UI_TOGGLE_DEBUG'}),
        toggleUseTransitions: () => ({type: 'UI_TOGGLE_USE_TRANSITIONS'}),
        setLayout: layout => ({type: 'UI_SET_LAYOUT', layout})
    }
};