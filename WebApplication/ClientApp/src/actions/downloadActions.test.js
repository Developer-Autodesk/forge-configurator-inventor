import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as downloadActions from './downloadActions';
import { actionTypes as uiFlagsActionTypes } from './uiFlagsActions';

const rfaLink = 'https://some.link';
const tokenMock = 'theToken';
const fullLink = `${rfaLink}/${tokenMock}`;
const errorReportLink = 'https://error.link';
const jobId = 'job1';

// prepare mock for signalR
import connectionMock from './connectionMock';

import * as signalR from '@aspnet/signalr';
signalR.HubConnectionBuilder = jest.fn();
signalR.HubConnectionBuilder.mockImplementation(() => ({
    withUrl: function(/*url*/) {
        return {
            configureLogging: function(/*trace*/) {
                return { build: function() { return connectionMock; }};
            }
        };
    }
}));

// prepare mock for Repository module
jest.mock('../Repository');
import repoInstance from '../Repository';
repoInstance.getAccessToken.mockImplementation(() => tokenMock);

Enzyme.configure({ adapter: new Adapter() });

// mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockState = {
  uiFlags: {
  }
};
const store = mockStore(mockState);

describe('downloadActions', () => {
    beforeEach(() => { // Runs before each test in the suite
        store.clearActions();
    });

    it('check getRFADownloadLink action', async () => {
        await store.dispatch(downloadActions.getRFADownloadLink("ProjectId", "temp_url"));
        // simulate conection.onComplete(rfaLink);
        connectionMock.simulateComplete(rfaLink);

        // check expected store actions
        const actions = store.getActions();
        const linkAction = actions.find(a => a.type === uiFlagsActionTypes.SET_RFA_LINK);
        expect(linkAction.url).toEqual(fullLink);
    });

    it('check report url and fail dialog on error', async () => {
        await store.dispatch(downloadActions.getRFADownloadLink("ProjectId", "temp_url"));
        connectionMock.simulateError(jobId,errorReportLink);

        // check expected store actions
        const actions = store.getActions();
        // there are two SET_REPORT_URL actions in the list. The first one come from job start and is called with null to clear old data...
        expect(actions.some(a => (a.type === uiFlagsActionTypes.SET_REPORT_URL && a.url === errorReportLink))).toEqual(true);
        expect(actions.some(a => a.type === uiFlagsActionTypes.SHOW_RFA_FAILED)).toEqual(true);
    });
});