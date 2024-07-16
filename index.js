import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import express from 'express'; 
import axios from 'axios';
const app = express();
const port = process.env.PORT || 3000;
const date = new Date().toLocaleTimeString();
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
 async function updateReadme(data) {
  try {
    const owner = 'lakshyasuthar';
    const repo = 'streakSaver';
    const path = 'README.md';
    const newContent = `City:Vadodara, weather ${data.text}, day:${data.day}, UpdatedAt:${date}` || "Readme Updated!";  // New content for the README.md file
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



// const job = schedule.scheduleJob('10 * * * * *', function(){
//     updateReadme()
//   });
const options = {
  method: 'GET',
  url: 'https://yahoo-weather5.p.rapidapi.com/weather',
  params: {
    location: 'vadodara',
    format: 'json',
    u: 'f'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.RAPIDAPI_HOST
  }
};
app.get('/', async (req, res) => {
  try {
    const response = await axios.request(options)
    updateReadme(response?.data?.forecasts[0])
    res.status(200).send('file updated');
  } catch (error) {
    res.status(500).send('server error');
  }
})

app.listen(port, () => {
  console.log(`server running on port ${port}`);
})