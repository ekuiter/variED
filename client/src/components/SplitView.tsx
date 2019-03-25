import React, {CSSProperties} from 'react';
import {OnSetSettingFunction} from '../store/types';
import withDimensions from '../helpers/withDimensions';
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
        let isDragging = false;

        function isTouchEvent(e: MouseEvent | TouchEvent | Touch): e is TouchEvent {
            return (window as any).TouchEvent && e instanceof TouchEvent;
        }

        const dragStart = () => {
                isDragging = true;
            },
            dragMove = (e: MouseEvent | TouchEvent | Touch) => {
                if (!isDragging)
                    return false;

                if (isTouchEvent(e))
                    e = e.touches[0];

                const content = this.contentRef.current!,
                    value = this.props.settings!.views.splitDirection === 'horizontal'
                    ? (e.clientX - content.offsetLeft) / content.offsetWidth
                    : (e.clientY - content.offsetTop) / content.offsetHeight;
                this.props.onSetSetting!({
                    path: 'views.splitAt',
                    value: Math.min(1, Math.max(0, value))
                });

                return true;
            },
            dragEnd = () => {
                isDragging = false;
            };

        this.handlerRef.current!.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        this.handlerRef.current!.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('touchend', dragEnd);

        this.handlerRef.current!.addEventListener('dblclick', () => {
            this.props.onSetSetting!({
                path: 'views.splitDirection',
                value: this.props.settings!.views.splitDirection === 'horizontal' ? 'vertical' : 'horizontal'
            });
        });
    }

    render() {
        const enableSecondaryView = this.props.enableSecondaryView();

        if (!this.contentRef.current)
            this.forceUpdate(); // TODO: this is not ideal - instead, pass width/height of view as props?

        return (
            <div className={'content ' + this.props.settings!.views.splitDirection} ref={this.contentRef}>
                {this.contentRef.current && this.props.renderPrimaryView(
                    enableSecondaryView
                        ? {
                            flex: '0 0 auto',
                            ...this.props.settings!.views.splitDirection === 'horizontal'
                            ? {width: this.props.settings!.views.splitAt * (this.contentRef.current.offsetWidth - 12)}
                            : {height: this.props.settings!.views.splitAt * (this.contentRef.current.offsetHeight - 12)}
                        }
                        : {})}
                <div className="handler" ref={this.handlerRef} style={{
                    display: enableSecondaryView ? 'block' : 'none'
                }}/>
                {enableSecondaryView && this.props.renderSecondaryView()}
            </div>
        );
    }
}

export default withDimensions<Props>(SplitView);
