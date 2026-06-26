#!/usr/bin/env node
/**
 * Peak Tracker UK — GitHub Setup Script
 *
 * Creates:
 *   - 9 GitHub Milestones
 *   - 1 GitHub Project (v2)
 *   - 85 GitHub Issues (assigned to milestones and project)
 *   - Updates docs/github-tickets.md with real issue URLs
 *
 * Usage:
 *   GITHUB_TOKEN=<your-pat> node scripts/setup-github.mjs
 *
 * Required PAT scopes:
 *   Classic PAT: repo + project
 *   Fine-grained PAT: Issues (read/write), Pull requests (read/write),
 *                     Repository: metadata (read), Projects (read/write)
 *
 * The script is idempotent for milestones (skips existing ones by title).
 * Issues are NOT idempotent — running twice will create duplicate issues.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'joeburton';
const REPO = 'peak-tracker';
const PROJECT_TITLE = 'Peak Tracker UK';

if (!TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required.');
  console.error('Usage: GITHUB_TOKEN=<your-pat> node scripts/setup-github.mjs');
  process.exit(1);
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function githubRest(method, path, body = null) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${method} ${path} → ${response.status}: ${text}`);
  }

  return response.json();
}

async function githubGraphQL(query, variables = {}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub GraphQL → ${response.status}: ${text}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
  }
  return json.data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Milestone data ───────────────────────────────────────────────────────────

const MILESTONES = [
  {
    num: 1,
    title: 'Milestone 1 — Foundation',
    description:
      'Project setup, tooling, CI, environment configuration. Goal: working Next.js 16 project with TypeScript strict mode, Tailwind, shadcn/ui, linting, and a CI pipeline that enforces all quality gates.',
  },
  {
    num: 2,
    title: 'Milestone 2 — Authentication',
    description:
      'Clerk setup, proxy.ts, protected routes, userId integration. Goal: users can sign in with Google, Apple, or GitHub. All progress-related routes require authentication.',
  },
  {
    num: 3,
    title: 'Milestone 3 — Database',
    description:
      'MongoDB setup, repository pattern, seed scripts, data sourcing from DoBIH. Goal: MongoDB connected, all indexes created, 214 Wainwrights and 282 Munros seeded and verified.',
  },
  {
    num: 4,
    title: 'Milestone 4 — Offline Architecture',
    description:
      'Dexie setup, IndexedDB repositories, schema migrations. Goal: all user progress persisted to IndexedDB. dirty flag correctly marks unsynced records. Schema is versioned and migratable.',
  },
  {
    num: 5,
    title: 'Milestone 5 — State Management',
    description:
      'Zustand stores, TanStack Query setup, centralised query keys. Goal: all server state through TanStack Query, all client UI state through Zustand. No raw fetch calls in components.',
  },
  {
    num: 6,
    title: 'Milestone 6 — Core UI',
    description:
      'Layout, navigation, home page, peak list page, search, filters, sorting, statistics, progress toggling. Goal: fully functional, navigable UI. Mobile-first. WCAG 2.1 AA.',
  },
  {
    num: 7,
    title: 'Milestone 7 — Synchronisation',
    description:
      'API routes, sync engine, conflict resolution. Goal: dirty local records sync to server when online. Last Write Wins conflict resolution. Sync state surfaced in the UI.',
  },
  {
    num: 8,
    title: 'Milestone 8 — PWA',
    description:
      'Service Worker, offline support, install prompt. Goal: app installable on iOS and Android, works fully offline, SW cache updates handled gracefully.',
  },
  {
    num: 9,
    title: 'Milestone 9 — Testing',
    description:
      'Bring unit test coverage to ≥ 80%. Full E2E suite passing. Goal: all quality gates pass — typecheck, lint, test, test:e2e, build. Project is production-ready.',
  },
];

// ─── Parse tickets from docs/github-tickets.md ────────────────────────────────

function parseTickets(markdownContent) {
  const tickets = [];

  // Split on ticket headings: ### [Category] Title
  // Use a lookahead so we don't consume the delimiter
  const sections = markdownContent.split(/(?=^### \[)/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed.startsWith('### [')) continue;

    const lines = trimmed.split('\n');
    const headingLine = lines[0];

    // Extract the title (strip "### " prefix)
    const title = headingLine.replace(/^### /, '').trim();

    // Extract milestone number
    const milestoneMatch = trimmed.match(/\*\*Milestone:\*\*\s+Milestone (\d+)/);
    if (!milestoneMatch) {
      console.warn(`  ⚠ Could not parse milestone for: ${title}`);
      continue;
    }
    const milestoneNum = parseInt(milestoneMatch[1], 10);

    // Build the issue body:
    //   - Skip the heading line (already used as the issue title)
    //   - Remove the "**GitHub Issue:** TBC" line
    //   - Trim trailing "---" separators
    const bodyLines = lines
      .slice(1)
      .filter((line) => !line.match(/^\*\*GitHub Issue:\*\*/))
      .join('\n')
      .replace(/\n---\s*$/, '')
      .trim();

    tickets.push({ title, body: bodyLines, milestoneNum });
  }

  return tickets;
}

// ─── Update github-tickets.md with real issue URLs ────────────────────────────

function updateTicketsMarkdown(markdownPath, issueMap) {
  let content = readFileSync(markdownPath, 'utf-8');

  for (const [title, { number, url }] of Object.entries(issueMap)) {
    // Escape special regex chars in the title
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match the "**GitHub Issue:** TBC" line that follows this ticket heading
    const pattern = new RegExp(`(### ${escapedTitle}[\\s\\S]*?\\*\\*GitHub Issue:\\*\\*)\\s*TBC`);

    const replacement = `$1 [#${number}](${url})`;
    const newContent = content.replace(pattern, replacement);

    if (newContent === content) {
      console.warn(`  ⚠ Could not find "GitHub Issue: TBC" for: ${title}`);
    } else {
      content = newContent;
    }
  }

  writeFileSync(markdownPath, content, 'utf-8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏔  Peak Tracker UK — GitHub Setup\n');

  // ── 1. Verify auth and get user node_id (needed for Projects v2) ──────────
  console.log('Verifying GitHub token...');
  let user;
  try {
    user = await githubRest('GET', `/users/${OWNER}`);
  } catch (err) {
    console.error(`✗ Failed to fetch user: ${err.message}`);
    process.exit(1);
  }
  console.log(`✓ Authenticated as: ${user.login} (node_id: ${user.node_id})\n`);

  // ── 2. Create milestones ──────────────────────────────────────────────────
  console.log('Creating milestones...');

  // Fetch existing milestones to handle idempotency
  let existingMilestones = [];
  try {
    existingMilestones = await githubRest(
      'GET',
      `/repos/${OWNER}/${REPO}/milestones?state=open&per_page=100`
    );
  } catch {
    // Ignore — we'll try to create all milestones
  }

  // Map milestone number (1–9) → GitHub milestone number
  const milestoneNumbers = {};

  for (const m of MILESTONES) {
    const existing = existingMilestones.find((e) => e.title === m.title);
    if (existing) {
      milestoneNumbers[m.num] = existing.number;
      console.log(`  → Existing: ${m.title} (#${existing.number})`);
      continue;
    }

    try {
      const result = await githubRest('POST', `/repos/${OWNER}/${REPO}/milestones`, {
        title: m.title,
        description: m.description,
        state: 'open',
      });
      milestoneNumbers[m.num] = result.number;
      console.log(`  ✓ Created: ${m.title} (#${result.number})`);
    } catch (err) {
      console.error(`  ✗ ${m.title}: ${err.message}`);
    }

    await sleep(150);
  }

  console.log();

  // ── 3. Create GitHub Project (v2) ─────────────────────────────────────────
  console.log('Creating GitHub Project (v2)...');
  let projectId = null;
  let projectUrl = null;

  try {
    // First check if a project with this title already exists
    const existingProjects = await githubGraphQL(
      `
      query GetUserProjects($login: String!) {
        user(login: $login) {
          projectsV2(first: 20) {
            nodes {
              id
              title
              url
            }
          }
        }
      }
    `,
      { login: OWNER }
    );

    const found = existingProjects?.user?.projectsV2?.nodes?.find((p) => p.title === PROJECT_TITLE);

    if (found) {
      projectId = found.id;
      projectUrl = found.url;
      console.log(`  → Existing project: ${projectUrl}`);
    } else {
      const created = await githubGraphQL(
        `
        mutation CreateProject($ownerId: ID!, $title: String!) {
          createProjectV2(input: { ownerId: $ownerId, title: $title }) {
            projectV2 {
              id
              number
              url
            }
          }
        }
      `,
        { ownerId: user.node_id, title: PROJECT_TITLE }
      );

      projectId = created.createProjectV2.projectV2.id;
      projectUrl = created.createProjectV2.projectV2.url;
      console.log(`  ✓ Created project: ${projectUrl}`);
    }
  } catch (err) {
    console.warn(`  ⚠ Could not create/find project: ${err.message}`);
    console.warn('    Issues will be created without project board assignment.\n');
  }

  console.log();

  // ── 4. Parse tickets ───────────────────────────────────────────────────────
  const ticketsPath = join(ROOT, 'docs', 'github-tickets.md');
  const markdownContent = readFileSync(ticketsPath, 'utf-8');

  console.log('Parsing tickets from docs/github-tickets.md...');
  const tickets = parseTickets(markdownContent);
  console.log(`Found ${tickets.length} tickets.\n`);

  if (tickets.length !== 85) {
    console.warn(`⚠ Expected 85 tickets, found ${tickets.length}. Continuing anyway...\n`);
  }

  // ── 5. Create issues ───────────────────────────────────────────────────────
  console.log('Creating issues...\n');

  // issueMap: title → { number, url, nodeId }
  const issueMap = {};
  let created = 0;
  let failed = 0;

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const milestoneNumber = milestoneNumbers[ticket.milestoneNum];

    if (!milestoneNumber) {
      console.warn(
        `  ⚠ No milestone number for M${ticket.milestoneNum} — skipping: ${ticket.title}`
      );
      failed++;
      continue;
    }

    try {
      const issue = await githubRest('POST', `/repos/${OWNER}/${REPO}/issues`, {
        title: ticket.title,
        body: ticket.body,
        milestone: milestoneNumber,
      });

      issueMap[ticket.title] = {
        number: issue.number,
        url: issue.html_url,
        nodeId: issue.node_id,
      };

      console.log(`  ✓ #${issue.number}: ${ticket.title}`);
      created++;

      // Add to project board
      if (projectId && issue.node_id) {
        try {
          await githubGraphQL(
            `
            mutation AddToProject($projectId: ID!, $contentId: ID!) {
              addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
                item { id }
              }
            }
          `,
            { projectId, contentId: issue.node_id }
          );
        } catch (projErr) {
          // Non-fatal — issue was still created
          console.warn(`    ⚠ Could not add #${issue.number} to project: ${projErr.message}`);
        }
      }
    } catch (err) {
      console.error(`  ✗ FAILED: ${ticket.title}`);
      console.error(`    ${err.message}`);
      failed++;
    }

    // Be polite to the GitHub API: 250ms between requests
    await sleep(250);
  }

  console.log();

  // ── 6. Update docs/github-tickets.md with real URLs ───────────────────────
  if (Object.keys(issueMap).length > 0) {
    console.log('Updating docs/github-tickets.md with real issue URLs...');
    try {
      updateTicketsMarkdown(ticketsPath, issueMap);
      console.log('✓ docs/github-tickets.md updated.\n');
    } catch (err) {
      console.warn(`⚠ Could not update github-tickets.md: ${err.message}\n`);
    }
  }

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════');
  console.log(`  Milestones: ${Object.keys(milestoneNumbers).length}/9`);
  console.log(`  Project board: ${projectUrl ?? '✗ not created'}`);
  console.log(`  Issues created: ${created}/${tickets.length}`);
  if (failed > 0) console.log(`  Issues failed:  ${failed}`);
  console.log();

  if (projectUrl) {
    console.log(`  🔗 Project board: ${projectUrl}`);
    console.log(`  🔗 Repository:    https://github.com/${OWNER}/${REPO}`);
    console.log(`  🔗 Milestones:    https://github.com/${OWNER}/${REPO}/milestones`);
    console.log(`  🔗 Issues:        https://github.com/${OWNER}/${REPO}/issues`);
  }

  console.log();

  if (failed === 0) {
    console.log('✅ All done! Phase 0 GitHub setup complete.');
  } else {
    console.log(`⚠ Done with ${failed} error(s). Review the output above.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
