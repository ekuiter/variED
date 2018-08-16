import React from 'react';
import FeatureModel from './featureModel/FeatureModel';
import {openWebSocket, sendMessage} from './server/webSocket';
import {handleMessage} from './server/handleMessage';

class App extends React.Component {
    state = {};

    componentDidMount() {
        openWebSocket(handleMessage);

        document.addEventListener('keydown', ({key}) => {
            return key === 'x' ? sendMessage({"type": "FEATURE_ADD", "belowFeature": "B"})
                : key === 'y' ? sendMessage({"type": "UNDO"}) : null;
        });
    }

    render() {
        return this.state.data
            ? <FeatureModel layout="horizontalTree" data={this.state.data}/>
            : <div className="loading"/>;
    }
}

export default App;
