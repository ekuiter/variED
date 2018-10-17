/**
 * Main entry point for testing.
 * Any settings and code specifically for the test environment go here.
 */

import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {setIconOptions} from 'office-ui-fabric-react/lib/Styling';

configure({adapter: new Adapter()});
setIconOptions({disableWarnings: true});