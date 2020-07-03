import actionTypes, { uploadPackage } from './uploadPackageActions';
import projectListActions from './projectListActions';
import { actionTypes as uiFlagsActionTypes } from './uiFlagsActions';

// the test based on https://redux.js.org/recipes/writing-tests#async-action-creators

// prepare mock for Repository module
jest.mock('../Repository');
import repoInstance from '../Repository';
const uploadPackageMock = repoInstance.uploadPackage;

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const packageData = {};

describe('uploadPackage', () => {

    beforeEach(() => {
        uploadPackageMock.mockClear();
    });

    it('should upload Package', async () => {

        // set expected value for the mock
        uploadPackageMock.mockReturnValue(packageData);

        const store = mockStore({ uiFlags: { package: { file: "a.zip", root: "a.asm"}} });

        await store.dispatch(uploadPackage()); // demand projects loading
        // ensure that the mock called once
        expect(uploadPackageMock).toHaveBeenCalledTimes(1);

        const actions = store.getActions();

        // check expected actions and their types
        expect(actions).toHaveLength(3); // TBD, currently just uiFlags to show and hide the progress
        expect(actions[0].type).toEqual(actionTypes.SET_UPLOAD_PROGRESS_VISIBLE);
        expect(actions[1].type).toEqual(projectListActions.ADD_PROJECT);
        expect(actions[2].type).toEqual(actionTypes.SET_UPLOAD_PROGRESS_DONE);

        // TBD check if the expected project is added to the project list
        // expect(actions[2].projectList).toEqual(testProjects);
    });

    it('should handle conflict', async () => {

        // set expected value for the mock
        uploadPackageMock.mockImplementation(() => { throw { response: { status: 409}}; });

        const store = mockStore({ uiFlags: { package: { file: "a.zip", root: "a.asm"}} });

        await store.dispatch(uploadPackage()); // demand projects loading
        // ensure that the mock called once
        expect(uploadPackageMock).toHaveBeenCalledTimes(1);

        const actions = store.getActions();

        // check expected actions and their types
        const conflictAction = actions.find(a => a.type === uiFlagsActionTypes.PROJECT_EXISTS);
        expect(conflictAction.exists).toEqual(true);
    });


    it('should handle workitem error', async () => {

        // set expected value for the mock
        const reportUrl = 'WI report url';
        uploadPackageMock.mockImplementation(() => { throw { response: { status: 422, data: { reportUrl: reportUrl}}}; });

        const store = mockStore({ uiFlags: { package: { file: "a.zip", root: "a.asm"}} });

        await store.dispatch(uploadPackage()); // demand projects loading
        // ensure that the mock called once
        expect(uploadPackageMock).toHaveBeenCalledTimes(1);

        const actions = store.getActions();

        // check expected actions and their types
        const uploadFailedAction = actions.find(a => a.type === actionTypes.SET_UPLOAD_FAILED);
        expect(uploadFailedAction.reportUrl).toEqual(reportUrl);
    });
});
