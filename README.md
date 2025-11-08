 🚀 GitHub ↔ LinkedIn Automation (ProjectSync)

An intelligent Node.js app that connects your **GitHub** and **LinkedIn** accounts to automate post creation for your repositories.
It fetches your GitHub projects, checks which ones are **not shared on LinkedIn**, and automatically creates posts for them using the **LinkedIn API**.

---

## 🧠 Features

* 🔗 **LinkedIn OAuth 2.0 Integration**
  Securely connects with your LinkedIn account using an authorization code flow.

* 🧾 **Automatic Access Token Handling**
  Stores and reuses your LinkedIn access token locally.

* 🧍 **View LinkedIn Profile Data**
  Fetch your profile details from LinkedIn API.

* 💬 **Post on LinkedIn**
  Publish custom posts directly to your LinkedIn feed.

* 🐙 **GitHub Integration**
  Fetch your GitHub user info and repositories using GitHub API.

* ⚙️ **Sync System**
  Automatically detect which GitHub repos aren’t yet posted on LinkedIn and publish them.

---

## 🛠️ Tech Stack

| Layer   | Technology                            |
| :------ | :------------------------------------ |
| Backend | Node.js, Express                      |
| APIs    | LinkedIn REST API v2, GitHub REST API |
| Auth    | LinkedIn OAuth 2.0                    |
| Other   | Axios, dotenv, fs                     |

---

## 📁 Project Structure

```
📦 linkedin-github-automation
├── .env
├── linkedin_token.txt
├── package.json
├── index.js  (main file)
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in your root directory and add the following:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GITHUB_USERNAME=your_github_username
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
PORT=3000
```

> 📝 Note:
>
> * You can get `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` from your [LinkedIn Developer App](https://www.linkedin.com/developers/apps).
> * The `GITHUB_PERSONAL_ACCESS_TOKEN` can be generated from your [GitHub Developer Settings](https://github.com/settings/tokens).

---

## 🚀 Setup & Run Locally

### 1️⃣ Clone this repo

```bash
git clone https://github.com/<your-username>/linkedin-github-automation.git
cd linkedin-github-automation
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the server

```bash
node index.js
```

### 4️⃣ Authenticate with LinkedIn

Open your browser and visit:

```
http://localhost:3000/auth/linkedin
```

Authorize your app — the access token will be saved automatically in `linkedin_token.txt`.

---

## 🧩 Available Routes

| Endpoint                  | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `/auth/linkedin`          | Redirects to LinkedIn login for OAuth                |
| `/auth/linkedin/callback` | Handles LinkedIn OAuth callback                      |
| `/linkedin/profile`       | Fetches LinkedIn profile info                        |
| `/linkedin/post`          | Creates a demo post on LinkedIn                      |
| `/github/user`            | Fetch GitHub profile data                            |
| `/github/repos`           | Fetch GitHub repositories                            |
| `/test/sync`              | Compares GitHub repos and LinkedIn posts             |
| `/test/generate/post`     | Generates sample text for missing repos              |
| `/linkedin/post/missing`  | Automatically posts missing GitHub repos to LinkedIn |

---

## 🧠 Example Flow

1. Start the server:
   `node index.js`

2. Go to [http://localhost:3000/auth/linkedin](http://localhost:3000/auth/linkedin)
   → Log in with your LinkedIn account.

3. Once authorized, visit:

   * `/linkedin/profile` → View your LinkedIn data
   * `/linkedin/post` → Post to LinkedIn
   * `/test/sync` → See repos not yet posted
   * `/linkedin/post/missing` → Auto-post those missing repos

---

## 🧑‍💻 Author

**Praharshitha**
[LinkedIn](https://www.linkedin.com/in/umamanipraharshitha) | [GitHub](https://github.com/<your-github-username>)

---


Would you like me to make it more **GitHub-styled (with emojis, code highlighting, badges, etc.)** for better presentation on your profile?
