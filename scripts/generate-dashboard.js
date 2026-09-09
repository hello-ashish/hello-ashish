import fs from 'fs';
import path from 'path';
import axios from 'axios';

const GITHUB_USERNAME = 'hello-ashish';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional, but prevents rate limiting

// Setup API headers
const headers = {
  'User-Agent': 'NodeJS/Dashboard-Generator'
};
if (GITHUB_TOKEN) {
  headers['Authorization'] = `token ${GITHUB_TOKEN}`;
}

async function fetchGitHubData() {
  try {
    // Basic user info
    const userResp = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers });
    const user = userResp.data;

    // Repositories info
    const reposResp = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers });
    const repos = reposResp.data.filter(repo => !repo.fork);
    
    // Count total stars
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

    return {
      public_repos: user.public_repos,
      followers: user.followers,
      total_stars: totalStars,
      company: user.company || 'AroundUs',
      bio: user.bio || 'Developer, Founder & Product Builder'
    };
  } catch (error) {
    console.error('Error fetching data from GitHub API. Falling back to default data.', error.message);
    // Fallback data if API fails (e.g. rate limit in local testing without token)
    return {
      public_repos: 23,
      followers: 1,
      total_stars: 0,
      company: 'AroundUs',
      bio: 'Founder AroundUs'
    };
  }
}

function generateSVG(data) {
  // A modern, dark-mode terminal/dashboard SVG design
  return `
<svg width="800" height="320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#161b22" />
    </linearGradient>

    <!-- Accent Gradient -->
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#14b8a6" />
    </linearGradient>

    <style>
      .text-title { font: 800 24px 'Inter', -apple-system, sans-serif; fill: #e6edf3; }
      .text-subtitle { font: 500 14px 'Inter', -apple-system, sans-serif; fill: #8b949e; letter-spacing: 1px; }
      .text-label { font: 600 12px 'Inter', -apple-system, sans-serif; fill: #8b949e; text-transform: uppercase; letter-spacing: 1.5px; }
      .text-value { font: 600 22px 'Inter', -apple-system, sans-serif; fill: #e6edf3; }
      .text-desc { font: 400 14px 'Inter', -apple-system, sans-serif; fill: #c9d1d9; }
      .accent { fill: #14b8a6; }
      
      .box { fill: #21262d; rx: 6; }
      .line { stroke: #30363d; stroke-width: 1; }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .cursor { fill: #14b8a6; animation: blink 1s step-end infinite; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="800" height="320" rx="12" fill="url(#bg-grad)" stroke="#30363d" stroke-width="1.5" />

  <!-- Header -->
  <text x="40" y="50" class="text-subtitle">System Overview / <tspan class="accent">ashish_gupta</tspan></text>
  <text x="40" y="85" class="text-title">ASHISH GUPTA <tspan class="cursor">_</tspan></text>
  
  <rect x="40" y="105" width="40" height="4" rx="2" fill="url(#accent-grad)" />

  <!-- Main Grid Left -->
  <text x="40" y="145" class="text-label">BUILDING</text>
  <text x="40" y="165" class="text-desc">${data.company}</text>

  <text x="40" y="210" class="text-label">CORE DOMAINS</text>
  <text x="40" y="230" class="text-desc">Web · AI · Real-time · Security</text>

  <text x="40" y="275" class="text-label">PRIMARY STACK</text>
  <text x="40" y="295" class="text-desc">TypeScript · Python · Java · C++ · React</text>

  <!-- Divider line -->
  <line x1="400" y1="130" x2="400" y2="295" class="line" />

  <!-- Main Grid Right -->
  <!-- Box 1 -->
  <rect x="440" y="130" width="150" height="75" class="box" />
  <text x="460" y="160" class="text-label">REPOSITORIES</text>
  <text x="460" y="190" class="text-value">${data.public_repos}</text>

  <!-- Box 2 -->
  <rect x="610" y="130" width="150" height="75" class="box" />
  <text x="630" y="160" class="text-label">FOLLOWERS</text>
  <text x="630" y="190" class="text-value">${data.followers}</text>

  <!-- Status Bar -->
  <rect x="440" y="225" width="320" height="70" class="box" />
  <text x="460" y="255" class="text-label">SYSTEM STATUS</text>
  <circle cx="465" cy="275" r="4" fill="#238636" />
  <text x="480" y="280" class="text-desc">Online. Building the next product.</text>

</svg>
  `;
}

async function main() {
  console.log('Fetching GitHub Data...');
  const data = await fetchGitHubData();
  
  console.log('Generating SVG Dashboard...');
  const svgContent = generateSVG(data);
  
  const outDir = path.join(process.cwd(), '../assets');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outFile = path.join(outDir, 'developer-dashboard.svg');
  fs.writeFileSync(outFile, svgContent.trim());
  
  console.log(`Dashboard generated successfully at: ${outFile}`);
}

main();
