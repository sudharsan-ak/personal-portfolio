import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = "sudharsan-ak";

if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN environment variable!");
}

const QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "GitHub token not configured" });
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: GITHUB_USERNAME },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded ${response.status}`);
    }

    const data = await response.json();
    const total = data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;

    if (typeof total !== "number") {
      throw new Error("Unexpected response shape from GitHub API");
    }

    res.status(200).json({ totalContributions: total });
  } catch (error) {
    console.error("GitHub stats error:", error);
    res.status(502).json({ error: "Failed to fetch GitHub contributions" });
  }
}
