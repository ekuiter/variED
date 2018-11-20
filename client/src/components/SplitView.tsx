import React, {CSSProperties} from 'react';
import {OnSetSettingFunction} from '../store/types';
import withDimensions from '../helpers/withDimensions';
import {wait} from '../helpers/wait';
import constants from '../constants';
import {Settings} from '../store/settings';

interface Props {
    width: number,
    height: number,
    settings: Settings,
    onSetSetting: OnSetSettingFunction,
    renderPrimaryView: (style: CSSProperties) => JSX.Element,
    renderSecondaryView: () => JSX.Element,
    enableSecondaryView: () => boolean
};

class SplitView extends React.Component<Props> {
    contentRef = React.createRef<HTMLDivElement>();
    handlerRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        let isDragging = false, wasDragged = false, wasSwitched = false;

        this.handlerRef.current!.addEventListener('mousedown', () => {
            isDragging = true;
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging)
                return false;

            const content = this.contentRef.current!,
                value = this.props.settings!.views.splitDirection === 'horizontal'
                ? (e.clientX - content.offsetLeft) / content.offsetWidth
                : (e.clientY - content.offsetTop) / content.offsetHeight;
            this.props.onSetSetting!({
                path: 'views.splitAt',
                value: Math.min(1, Math.max(0, value))
            });
            wasDragged = true;

            return true;
        });

        document.addEventListener('mouseup', (e) => {
            if (!wasDragged && this.handlerRef.current!.contains(e.target as any))
                wait(200).then(() => {
                    if (!wasSwitched)
                        this.props.onSetSetting!({
                            path: 'views.splitAt',
                            value: this.props.settings!.views.splitAt === 1 ? constants.views.splitMiddle :
                                this.props.settings!.views.splitAt === constants.views.splitMiddle ? 0 : 1
                        });
                });
            wasDragged = isDragging = wasSwitched = false;
        });

        this.handlerRef.current!.addEventListener('dblclick', () => {
            this.props.onSetSetting!({
                path: 'views.splitDirection',
                value: this.props.settings!.views.splitDirection === 'horizontal' ? 'vertical' : 'horizontal'
            });
            wasSwitched = true;
        });
    }

    render() {
        const enableSecondaryView = this.props.enableSecondaryView();

        return (
            <div className={'content ' + this.props.settings!.views.splitDirection} ref={this.contentRef}>
                {this.props.renderPrimaryView(
                    enableSecondaryView
                        ? {
                            flex: '0 0 auto',
                            ...this.props.settings!.views.splitDirection === 'horizontal'
                            ? {width: this.props.settings!.views.splitAt * (this.contentRef.current!.offsetWidth - 12)}
                            : {height: this.props.settings!.views.splitAt * (this.contentRef.current!.offsetHeight - 12)}
                        }
                        : {})}
                <div className="handler" ref={this.handlerRef} style={{
                    display: enableSecondaryView ? 'block' : 'none'
                }}>
                    <div className="handler-content">…</div>
                </div>
                {enableSecondaryView && this.props.renderSecondaryView()}
            </div>
        );
    }
}

export default withDimensions<Props>(SplitView);
