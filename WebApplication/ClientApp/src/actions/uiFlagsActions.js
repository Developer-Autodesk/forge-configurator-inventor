import repo from '../Repository';
import {addError} from './notificationActions';

export const actionTypes = {
    REJECT_PARAMETERS_EDITED_MESSAGE: 'REJECT_PARAMETERS_EDITED_MESSAGE',
    FETCH_SHOW_PARAMETERS_CHANGED: 'FETCH_SHOW_PARAMETERS_CHANGED',
    CLOSE_PARAMETERS_EDITED_MESSAGE: 'CLOSE_PARAMETERS_EDITED_MESSAGE',
    SHOW_UPDATE_PROGRESS: 'SHOW_UPDATE_PROGRESS',
    SHOW_RFA_PROGRESS: 'SHOW_RFA_PROGRESS',
    HIDE_RFA_PROGRESS: 'HIDE_RFA_PROGRESS',
    SET_RFA_LINK: 'SET_RFA_LINK'
};

export default actionTypes;

export const closeParametersEditedMessage = () => {
    return {
        type: actionTypes.CLOSE_PARAMETERS_EDITED_MESSAGE
    };
};

export const hideUpdateMessageBanner = (permanently) => async (dispatch) => {

    if (permanently === true) {
       const result = await repo.sendShowParametersChanged(false);
       dispatch(rejectParametersEditedMessage(!result));
    }

    dispatch(closeParametersEditedMessage());
};

export const rejectParametersEditedMessage = (show) => {
    return {
        type: actionTypes.REJECT_PARAMETERS_EDITED_MESSAGE,
        show
    };
};

export const fetchShowParametersChanged = () => async (dispatch) => {
    try {
        const showParametersChanged = await repo.loadShowParametersChanged();
        dispatch(rejectParametersEditedMessage(!showParametersChanged));
    } catch (error) {
        dispatch(addError('Failed to get information about "show changed parameters" . (' + error + ')'));
    }
};

export const showUpdateProgress = (visible) => {
    return {
        type: actionTypes.SHOW_UPDATE_PROGRESS,
        visible
    };
};

export const showRFAModalProgress = (projectId) => {
    return {
        type: actionTypes.SHOW_RFA_PROGRESS,
        projectId
    };
};

export const hideRFAModalProgress = () => {
    return {
        type: actionTypes.HIDE_RFA_PROGRESS
    };
};

export const setRFALink = (url) => {
    return {
        type: actionTypes.SET_RFA_LINK,
        url
    };
};