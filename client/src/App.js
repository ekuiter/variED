import React from 'react';
import FeatureModel from './featureModel/FeatureModel';
import Constants from './Constants';

class App extends React.Component {
    state = {};

    componentDidMount() {
        const webSocket = new WebSocket(Constants.websocket);

        webSocket.onopen = () => console.log('open');
        webSocket.onclose = () => console.log('close');
        webSocket.onerror = e => console.log('error:', e);
        webSocket.onmessage = message => {
            let data = JSON.parse(message.data);
            console.log('received', data);
            if (data.type === Constants.message.FEATURE_MODEL)
                this.setState({data: data.featureModel.struct[0]});
        };

        document.addEventListener('keydown', ({key}) => {
            const send = message => {
                console.log('sent', message);
                webSocket.send(JSON.stringify(message));
            };
            return key === 'x' ? send({"type": "FEATURE_ADD", "belowFeature": "B"})
                : key === 'y' ? send({"type": "UNDO"}) : null;
        });
    }

    render() {
        return this.state.data
            ? <FeatureModel layout="horizontalTree" data={this.state.data}/>
            : <div className="loading"/>;
    }
}

export default App;
