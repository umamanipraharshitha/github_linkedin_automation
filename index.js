import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json()); // Needed for POST body parsing

// --- LinkedIn credentials ---
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const githubUsername = process.env.GITHUB_USERNAME;
const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

// --- Must exactly match your LinkedIn app redirect URL ---
const redirectUri = "http://localhost:3000/auth/linkedin/callback";

// --- Step 1: Redirect user to LinkedIn authorization ---
app.get("/auth/linkedin", (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=openid%20profile%20email%20w_member_social`;

  console.log("Redirecting user to LinkedIn authorization URL...");
  res.redirect(authUrl);
});

// --- Step 2: LinkedIn callback ---
app.get("/auth/linkedin/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("❌ No authorization code received.");

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const tokenRes = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenRes.data.access_token;
    fs.writeFileSync("linkedin_token.txt", accessToken);

    res.send(`
      <h3>✅ LinkedIn Access Token Saved!</h3>
      <p>Access Token: <code>${accessToken}</code></p>
      <a href="/linkedin/profile">➡️ View LinkedIn Profile</a><br>
      <a href="/linkedin/post">➡️ Create LinkedIn Post</a>
    `);
  } catch (err) {
    console.error("Error fetching access token:", err.response?.data || err.message);
    res.status(500).send("❌ Error fetching access token. Check console for details.");
  }
});

// --- Step 3: LinkedIn profile ---
app.get("/linkedin/profile", async (req, res) => {
  try {
    const accessToken = fs.readFileSync("linkedin_token.txt", "utf-8");
    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.send(`<h2>✅ LinkedIn Profile Info</h2><pre>${JSON.stringify(profileRes.data, null, 2)}</pre>`);
  } catch (err) {
    console.error("Error fetching profile:", err.response?.data || err.message);
    res.status(500).send("❌ Error fetching profile. Check console for details.");
  }
});

// --- Step 4: LinkedIn post (real) ---
app.get("/linkedin/post", async (req, res) => {
  try {
    const accessToken = fs.readFileSync("linkedin_token.txt", "utf-8");
    const meResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const personURN = `urn:li:person:${meResponse.data.sub}`;

    const postData = {
      author: personURN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: "🚀 Hello LinkedIn — posted via my Node.js ProjectSync app!" },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const postRes = await axios.post("https://api.linkedin.com/v2/ugcPosts", postData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    res.send(`<h2>✅ Post created successfully!</h2><pre>${JSON.stringify(postRes.data, null, 2)}</pre>`);
  } catch (err) {
    console.error("Error posting to LinkedIn:", err.response?.data || err.message);
    res.status(500).send("❌ Error creating LinkedIn post. Check console for details.");
  }
});

// --- GitHub user ---
app.get("/github/user", async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}`, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const data = {
      username: response.data.login,
      name: response.data.name,
      bio: response.data.bio,
      public_repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
      profile_url: response.data.html_url,
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching GitHub user data:", error.response?.data || error.message);
    res.status(500).send("❌ Error fetching GitHub data");
  }
});

// --- GitHub repos ---
app.get("/github/repos", async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
      headers: { Authorization: `token ${githubToken}` },
    });

    const repos = response.data.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
    }));

    res.json(repos);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error.response?.data || error.message);
    res.status(500).send("❌ Error fetching GitHub repos");
  }
});

// --- TEST ROUTES ---
// Test GitHub vs Mock LinkedIn posts
app.get("/test/sync", async (req, res) => {
  try {
    // Mock LinkedIn posts
    const linkedinPosts = [
      "Portfolio Website",
      "AI-Chatbot Project",
      "Hello World Post"
    ];

    // Fetch GitHub repos
    const githubReposRes = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
      headers: { Authorization: `token ${githubToken}` },
    });

    const githubRepos = githubReposRes.data.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
    }));

    // Find missing repos
    const missingRepos = githubRepos.filter(
      repo => !linkedinPosts.some(post => post.includes(repo.name))
    );

    res.json({ githubRepos, linkedinPosts, missingRepos });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ Error in test sync");
  }
});

// Mock Gemini post generation
app.post("/test/generate/post", (req, res) => {
  const missingRepos = req.body.missingRepos || [];
  if (!missingRepos.length) return res.send("✅ No missing repos to generate post!");

  const mockGeneratedPost = `Check out these amazing projects: ${missingRepos.map(r => r.name).join(", ")}. 🚀`;

  res.json({ generatedPost: mockGeneratedPost });
});
// --- Post missing GitHub repos to LinkedIn (mock / real-ready) ---
// --- Post all missing GitHub repos to LinkedIn ---
app.get("/linkedin/post/missing", async (req, res) => {
  try {
    const accessToken = fs.readFileSync("linkedin_token.txt", "utf-8");

    // Fetch GitHub repos
    const githubReposRes = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
      headers: { Authorization: `token ${githubToken}` },
    });

    const githubRepos = githubReposRes.data.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
    }));

    // Fetch LinkedIn posts to check missing ones
    const linkedinPostsRes = await axios.get(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:YOUR_PERSON_URN)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const linkedinPosts = linkedinPostsRes.data.elements.map(post =>
      post.specificContent["com.linkedin.ugc.ShareContent"].shareCommentary.text
    );

    // Find missing repos
    const missingRepos = githubRepos.filter(
      repo => !linkedinPosts.some(post => post.includes(repo.name))
    );

    if (!missingRepos.length) return res.send("✅ No missing repos to post!");

    // --- Loop to create LinkedIn posts for missing repos ---
    const postResults = [];
    const meResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const personURN = `urn:li:person:${meResponse.data.sub}`;

    for (const repo of missingRepos) {
      const postData = {
        author: personURN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: `🚀 Check out my GitHub project "${repo.name}"! ${repo.description || ""} GitHub: ${repo.url}`
            },
            shareMediaCategory: "NONE"
          }
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
      };

      const postRes = await axios.post("https://api.linkedin.com/v2/ugcPosts", postData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });

      postResults.push({ repo: repo.name, postId: postRes.data.id });
    }

    console.log("✅ Posted missing repos to LinkedIn:", postResults);
    res.send({
      message: "✅ All missing GitHub repos posted to LinkedIn.",
      results: postResults
    });

  } catch (err) {
    console.error("Error posting missing repos:", err.response?.data || err.message);
    res.status(500).send("❌ Error posting missing repos to LinkedIn.");
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`👉 Server running on http://localhost:${PORT}`);
  console.log(`👉 Test sync: http://localhost:${PORT}/test/sync`);
});
