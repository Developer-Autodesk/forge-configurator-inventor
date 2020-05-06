import repo from '../Repository';
import {addError, addLog} from './notificationActions';
import { fetchParameters } from './parametersActions';

const actionTypes = {
    PROJECT_LIST_UPDATED: 'PROJECT_LIST_UPDATED',
    ACTIVE_PROJECT_UPDATED: 'ACTIVE_PROJECT_UPDATED',
    PARAMETERS_UPDATED: 'PARAMETERS_UPDATED',
    PARAMETER_EDITED: 'PARAMETER_EDITED',
    PARAMETERS_RESET: 'PARAMETERS_RESET'
};

export default actionTypes;

export const updateProjectList = projectList => {
    return {
        type: actionTypes.PROJECT_LIST_UPDATED,
        projectList
    };
};

export const updateActiveProject = activeProjectId => {
    return {
        type: actionTypes.ACTIVE_PROJECT_UPDATED,
        activeProjectId
    };
};

// eslint-disable-next-line no-unused-vars
export const fetchProjects = () => async (dispatch, getState) => {
    dispatch(addLog('Load Projects invoked'));
    try {
        const data = await repo.loadProjects();
        dispatch(addLog('Load Projects received'));
        dispatch(updateProjectList(data));
    } catch (error) {
        dispatch(addError('Failed to get Project list. (' + error + ')'));
    }
};
