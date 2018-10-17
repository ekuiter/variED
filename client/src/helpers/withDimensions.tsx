/**
 * Higher-order component that injects the current viewport's width and height into a component.
 * This is useful for resizing components spanning the whole viewport that require
 * absolute width and height values.
 */

import React from 'react';
import throttle from './throttle';
import constants from '../constants';

function getViewportDimension(key: string) {
    return Math.max(document.documentElement[key], 0);
}

export const getViewportWidth = () => getViewportDimension('clientWidth'),
    getViewportHeight = () => getViewportDimension('clientHeight');

interface State {
    width: number,
    height: number
};

export default (WrappedComponent: React.ComponentClass<State>): React.ComponentClass<object, State> =>
    class extends React.Component<object, State> {
        state: State = {
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
            return <WrappedComponent width={this.state.width} height={this.state.height} {...this.props}/>;
        }
    };