import React from 'react';
import {KernelConflict} from '../../modeling/types';

interface Props {
    conflict: KernelConflict
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <div>
                <p><strong>A conflict occurred.</strong></p>
            </div>
        );
    }
}