import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ISSUES_DIR = path.join(__dirname, '..', '.github', 'issues');
const REPO_OWNER = 'Vicsygold';
const REPO_NAME = 'agrolock';

const token = process.env.GITHUB_TOKEN || process.argv[2];

if (!token) {
  console.error('Usage: GITHUB_TOKEN=your_token node scripts/create-github-issues.js');
  console.error('Or: node scripts/create-github-issues.js your_token');
  process.exit(1);
}

async function createIssue(title, body, labels) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'AgroLock-Issue-Creator',
    },
    body: JSON.stringify({ title, body, labels }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to create issue "${title}": ${data.message || res.statusText}`);
  }
  return data;
}

async function run() {
  const files = readdirSync(ISSUES_DIR).filter((f) => f.endsWith('.md')).sort();
  console.log(`Found ${files.length} issue markdown files in .github/issues/...\n`);

  for (const file of files) {
    const filePath = path.join(ISSUES_DIR, file);
    const content = readFileSync(filePath, 'utf-8');

    const lines = content.split('\n');
    const titleMatch = lines[0].match(/^#\s+(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : file;

    const labelsMatch = content.match(/\*\*Labels:\*\*\s*(.*)/);
    const labels = labelsMatch
      ? labelsMatch[1].split(',').map((l) => l.replace(/`/g, '').trim()).filter(Boolean)
      : [];

    console.log(`Creating issue: "${title}"...`);
    try {
      const created = await createIssue(title, content, labels);
      console.log(`  -> Created Issue #${created.number}: ${created.html_url}`);
    } catch (err) {
      console.error(`  -> ERROR: ${err.message}`);
    }
  }
}

run();
