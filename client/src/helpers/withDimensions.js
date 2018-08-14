import React from 'react';
import Constants from '../Constants';

function throttle(func, wait) {
    let timer = null;
    return function(...args) {
        if (timer === null) {
            timer = setTimeout(() => {
                func.apply(this, args);
                timer = null;
            }, wait);
        }
    };
}

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
            }), Constants.viewport.throttleResize);

        render() {
            return <WrappedComponent width={this.state.width} height={this.state.height} {...this.props} />;
        }
    };