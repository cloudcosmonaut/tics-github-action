import { jest } from '@jest/globals';

jest.mock('../src/github/configuration', () => {
  return {
    ticsConfig: {
      projectName: 'project',
      ticsConfiguration: 'http://localhost/tiobeweb/TiCS/api/cfg?name=default'
    },
    githubConfig: {
      repo: 'test',
      owner: 'tester',
      reponame: 'test',
      branchname: '',
      basebranchname: '',
      branchdir: '',
      eventName: '',
      runnerOS: '',
      pullRequestNumber: '1'
    },
    octokit: {
      paginate: jest.fn(),
      rest: {
        pulls: {
          listFiles: () => {},
          listReviewComments: () => {},
          createReview: jest.fn(),
          deleteReviewComment: jest.fn()
        },
        issues: {
          createComment: jest.fn()
        }
      }
    },
    httpClient: {
      get: jest.fn()
    },
    viewerUrl: '<url>'
  };
});
jest.mock('@actions/core', () => {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    setFailed: jest.fn()
  };
});
jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn()
  };
});
jest.mock('canonical-path', () => {
  return {
    resolve: jest.fn(data => data),
    normalize: jest.fn(data => data)
  };
});
jest.mock('markdown-table', () => {
  return {
    markdownTable: jest.fn(() => '|header|\n|---|\n|body|')
  };
});
jest.mock('proxy-agent', () => {
  return jest.fn();
});
