import React from 'react';
import throttle from './throttle';
import constants from '../constants';

function getViewportDimension(key) {
    return Math.max(document.documentElement[key], 0);
}

export default WrappedComponent =>
    class extends React.Component {
        state = {
            width: getViewportDimension('clientWidth'),
            height: getViewportDimension('clientHeight')
        };

        componentDidMount() {
            window.addEventListener('resize', this.onResize);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.onResize);
        }

        onResize = throttle(() =>
            this.setState({
                width: getViewportDimension('clientWidth'),
                height: getViewportDimension('clientHeight')
            }), constants.helpers.withDimensions.throttleResize);

        render() {
            return <WrappedComponent width={this.state.width} height={this.state.height} {...this.props} />;
        }
    };