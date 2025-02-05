import { githubConfig, ticsConfig } from '../../src/configuration';
import { Analysis } from '../../src/helper/interfaces';
import Logger from '../../src/helper/logger';
import fetch from 'node-fetch';
import { cliSummary, getInstallTicsApiUrl, getItemFromUrl, getProjectName, getTicsWebBaseUrlFromUrl, httpRequest } from '../../src/tics/api_helper';

describe('httpRequest', () => {
  test('Should return response on status 200', async () => {
    // testing without setting TiCS Auth Token at least once
    const resJson = jest.fn(() => Promise.resolve({ data: 'body' }));
    const exit = jest.spyOn(Logger.Instance, 'exit');
    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: 200, json: resJson }));

    const response = await httpRequest<any>('url');
    expect(response.data).toEqual('body');
    expect(exit).toHaveBeenCalledTimes(0);
  });

  test('Should return undefined response and call exit on status 302', async () => {
    ticsConfig.ticsAuthToken = 'authToken'; // test setting TiCS Auth Token at least once
    const resJson = jest.fn(() => Promise.resolve({ data: 'body' }));
    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: 302, json: resJson }));
    const exit = jest.spyOn(Logger.Instance, 'exit');

    const response = await httpRequest<any>('url');
    const calledWith =
      'HTTP request failed with status 302. Please check if the given ticsConfiguration is correct (possibly http instead of https).';

    expect(response).toEqual(undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(calledWith);
  });

  test('Should return undefined response and call exit on status 400', async () => {
    const resJson = jest.fn(() => Promise.resolve({ data: 'body', alertMessages: [{ header: 'header' }] }));

    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: 400, json: resJson }));
    const exit = jest.spyOn(Logger.Instance, 'exit');

    const response = await httpRequest<any>('url');
    const calledWith = 'HTTP request failed with status 400. header';

    expect(response).toEqual(undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(calledWith);
  });

  test('Should return undefined response and call exit on status 401', async () => {
    const resJson = jest.fn(() => Promise.resolve({ data: 'body', alertMessages: [{ header: 'header' }] }));

    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: 401, json: resJson }));
    const exit = jest.spyOn(Logger.Instance, 'exit');

    const response = await httpRequest<any>('url');
    const calledWith =
      'HTTP request failed with status 401. Please provide a valid TICSAUTHTOKEN in your configuration. Check <url>/Administration.html#page=authToken';

    expect(response).toEqual(undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(calledWith);
  });

  test('Should return undefined response and call exit on status 404', async () => {
    const resJson = jest.fn(() => Promise.resolve({ data: 'body', alertMessages: [{ header: 'header' }] }));

    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: 404, json: resJson }));
    const exit = jest.spyOn(Logger.Instance, 'exit');

    const response = await httpRequest<any>('url');
    const calledWith = 'HTTP request failed with status 404. Please check if the given ticsConfiguration is correct.';

    expect(response).toEqual(undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(calledWith);
  });

  test('Should return undefined response and call exit on status null', async () => {
    const resJson = jest.fn(() => Promise.resolve({ data: 'body', alertMessages: [{ header: 'header' }] }));

    (fetch as any).mockImplementationOnce((): Promise<any> => Promise.resolve({ status: null, json: resJson }));
    const exit = jest.spyOn(Logger.Instance, 'exit');

    const response = await httpRequest<any>('url');
    const calledWith = 'HTTP request failed with status null. Please check if your configuration is correct.';

    expect(response).toEqual(undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(calledWith);
  });
});

describe('cliSummary', () => {
  test('Should post errors and warnings on logLevel debug, cliSummary.', async () => {
    const error = jest.spyOn(Logger.Instance, 'error');
    const warning = jest.spyOn(Logger.Instance, 'warning');

    githubConfig.debugger = true;

    const analysis: Analysis = {
      completed: false,
      statusCode: -1,
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning']
    };
    cliSummary(analysis);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(2);
  });

  test('Should post errors and no warnings on logLevel default, cliSummary.', async () => {
    const error = jest.spyOn(Logger.Instance, 'error');
    const warning = jest.spyOn(Logger.Instance, 'warning');

    githubConfig.debugger = false;

    const analysis: Analysis = {
      completed: false,
      statusCode: -1,
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning']
    };
    cliSummary(analysis);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(0);
  });
});

describe('getInstallTicsApiUrl', () => {
  test('Should append configuration url with platform and url', () => {
    ticsConfig.ticsConfiguration = 'http://localhost/tiobeweb/TiCS/api/cfg?name=default';

    const installTicsApiUrl = getInstallTicsApiUrl('http://localhost/tiobeweb/TiCS', 'Linux');

    const decodedUrl = decodeURIComponent(installTicsApiUrl);

    expect(decodedUrl).toEqual('http://localhost/tiobeweb/TiCS/api/cfg?name=default&platform=Linux&url=http://localhost/tiobeweb/TiCS');
  });
});

describe('getTicsWebBaseUrlFromUrl', () => {
  test('Should return base url from correct url.', () => {
    const baseUrl = getTicsWebBaseUrlFromUrl('http://localhost/tiobeweb/TiCS/api/cfg?name=default');
    expect(baseUrl).toEqual('http://localhost/tiobeweb/TiCS');
  });

  test('Should return empty string from incorrect url.', () => {
    const spy = jest.spyOn(Logger.Instance, 'exit');

    const baseUrl = getTicsWebBaseUrlFromUrl('http://localhost/tiobeweb/TiCS/cfg?name=default');
    expect(baseUrl).toEqual('');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getItemFromUrl', () => {
  test('Should return item with with spaces if + is in the url.', async () => {
    const projectName = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Item');
    expect(projectName).toEqual('hello world');
  });

  test('Should not return item if not found in url.', async () => {
    const projectName = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Project');
    expect(projectName).toEqual('');
  });
});

describe('getProjectName', () => {
  test('Should return project name from url if project auto', async () => {
    ticsConfig.projectName = 'auto';

    const projectName = getProjectName('https://test.com/Project%28project%29');
    expect(projectName).toEqual('project');
  });

  test('Should return default project name from url if projectName is given', async () => {
    ticsConfig.projectName = 'project';

    const projectName = getProjectName('https://test.com/Project%28auto%29');
    expect(projectName).toEqual(ticsConfig.projectName);
  });
});
