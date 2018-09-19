import React from 'react';
import {shallow} from 'enzyme';
import AboutPanel from './AboutPanel';

describe('AboutPanel', () => {
    it('renders correctly', () => {
        const mock = jest.fn(),
            wrapper = shallow(
                <AboutPanel
                    isOpen={true}
                    onDismissed={mock}/>
            );
        expect(wrapper).toMatchSnapshot();
    });
});