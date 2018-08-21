import messageActions from './server/messageActions';
import {setSetting} from './settings';

const Actions = {
    server: messageActions,
    setSetting
};

export default Actions;