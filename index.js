import { Octokit } from '@octokit/rest';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
dotenv.config();
// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,  // Replace with your GitHub token
});

async function getReadmeSha(owner, repo, path) {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });
    return response.data.sha;
  } catch (error) {
    console.error('Error getting SHA of README.md:', error);
    throw error;
  }
}

async function updateReadme() {
  try {
    const owner = 'lakshyasuthar';
    const repo = 'streakSaver';
    const path = 'README.md';
    const newContent = 'Streak Saver Commits';  // New content for the README.md file
    const encodedContent = Buffer.from(newContent).toString('base64');  // Base64 encode the new content

    // Get the current README file's SHA
    const sha = await getReadmeSha(owner, repo, path);

    // Commit the new content to the README.md file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'Auto commit: Update README.md',
      committer: {
        name: 'Lakshya',
        email: 'lakshyasuthar.freelance@gmail.com'
      },
      content: encodedContent,
      sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log('README.md updated successfully.');
  } catch (error) {
    console.error('Error updating README.md:', error);
  }
}

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;


const job = schedule.scheduleJob('12 12 * * *', function(){
    updateReadme()
});

