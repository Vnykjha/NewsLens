<div align="center">
  <img src="https://img.icons8.com/color/120/000000/news.png" alt="NewsLens Logo" />
  <h1>📰 NewsLens</h1>
  <p><strong>Your AI-Native News Intelligence Platform</strong></p>
  <p>Understand the full story with credibility analysis, multiple perspectives, and community notes.</p>
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
</div>

<hr/>

## 🌟 Why NewsLens?

In today's fast-paced world, it's hard to separate fact from fiction. **NewsLens** isn't just a news reader—it's an intelligence report in your pocket. Powered by AI, it breaks down complex stories into bite-sized, unbiased pieces.

- **📊 Credibility Scores:** Know exactly how trustworthy an article is before you read it.
- **👁️ Multi-Perspective:** Instantly see the supporting, alternative, and contradictory angles of any story.
- **🤝 Community Notes:** Upvote, downvote, and add context to articles alongside a community of readers.

---

## 🚀 Quick Start Guide

Ready to dive in? Here’s everything you need to get the app running on your machine.

### 📋 Prerequisites
Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v24 or higher recommended)
- `pnpm` (run `npm install -g pnpm` if you don't have it)
- [Expo Go](https://expo.dev/go) app on your mobile device (or an iOS/Android emulator)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/Vnykjha/NewsLens.git
cd NewsLens
pnpm install
```

### 2️⃣ Environment Variables
Create a `.env` file in the root directory and add your keys (you already have this set up locally!):
```env
DATABASE_URL=your_postgres_connection_string
NEWS_API_KEY=your_news_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3️⃣ Run the Application

You'll need **two separate terminal windows** to run the backend and frontend at the same time.

**Terminal 1: Start the Backend Server**
```bash
# This starts the Express API server on port 5000
pnpm --filter @workspace/api-server run dev
```

**Terminal 2: Start the Mobile App**
```bash
# This starts Expo. Press 'a' for Android, 'i' for iOS, or scan the QR code!
pnpm --filter @workspace/newslens exec expo start
```

---

## 🛠 What's Under the Hood?

We built NewsLens with a modern, scalable, and fast stack:

| Technology | Purpose |
| ---------- | ------- |
| **Expo & React Native** | Cross-platform mobile frontend |
| **Express.js (v5)** | High-performance backend API |
| **PostgreSQL & Drizzle ORM**| Rock-solid database and queries |
| **Zod & Orval** | End-to-end type safety and API code generation |
| **pnpm Workspaces** | Monorepo package management |

---

## 📁 Repository Structure

```text
📦 NewsLens
 ┣ 📂 artifacts
 ┃ ┣ 📂 newslens      --> The Expo mobile app (Frontend)
 ┃ ┗ 📂 api-server    --> The Express backend server
 ┣ 📂 lib
 ┃ ┣ 📂 db            --> Database schemas and Drizzle setup
 ┃ ┗ 📂 api-spec      --> OpenAPI specifications and contracts
 ┗ 📜 pnpm-workspace.yaml
```

---

<div align="center">
  <i>Built with ❤️ for a smarter, more informed world.</i>
</div>
