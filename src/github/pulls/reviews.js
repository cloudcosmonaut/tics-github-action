import core from '@actions/core';
import github from '@actions/github';
import { githubConfig } from '../configuration.js';

//Octokit client is authenticated
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

export async function createPRReview(review) {
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: review.event,
      body: review.body,
      comments: review.comments
    };

    await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', params);
    core.info('\u001b[35mPosted a review for this Pull Request.');
  } catch (e) {
    core.error(`We cannot post review on this Pull Request: ${e}`);
  }
}

export async function getAllPRReviewComments() {
  try {
    let allReviews = [];
    var noMoreFiles;
    for (var i = 1; i <= 30; i++) {
      const params = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        per_page: 100,
        page: i
      };
      await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', params).then((response) => {
        if (response.data.length > 0) {
          response.data.map((item) => {
            allReviews.push(item);
          });
        } else {
          noMoreFiles = true;
        }
      });
      if (noMoreFiles) {
        break;
      }
    }
    return allReviews;
  } catch (e) {
    core.error(`We cannot get the annotations of this PR: ${e}`);
  }
}

export function deletePRReviewComments(reviewCommentIds) {
  try {
    core.info('\u001b[35mDeleting review comments of previous runs');
    reviewCommentIds.map(async (id) => {
      const params = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        comment_id: id
      };
      await octokit.request('DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}', params);
    });
  } catch (e) {
    core.error(`We cannot delete the annotations of this PR: ${e}`);
  }
}