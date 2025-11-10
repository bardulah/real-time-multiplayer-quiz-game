# Agent Handoff Document: real-time-multiplayer-quiz-game

**Last Updated**: 2025-11-10
**Current Agent**: Gemini

---

## 🎯 1. Current Status

### Project Overview
This is a full-stack web application that allows multiple users to compete in a real-time quiz. It features game rooms, live scoring, real-time chat, and persistent user statistics.

### Deployment Status
*   **Status**: ✅ **LIVE**
*   **Platform**: VPS (via PM2)
*   **Live URL**: [https://quiz.curak.xyz](https://quiz.curak.xyz)
*   **Internal Port**: `3003`

### Technology Stack
*   **Backend**: Node.js, TypeScript, Express, Socket.io
*   **Frontend**: Vanilla JavaScript, HTML5, CSS3
*   **Database**: SQLite (`better-sqlite3`)
*   **Infrastructure**: Deployed on a VPS, managed by PM2, with Nginx as a reverse proxy.

### Key Files
*   `INSTRUCTIONS.md`: User-facing guide on how to play the game.
*   `ecosystem.config.js`: (Located in `/opt/deployment/`) PM2 configuration file.
*   `src/server/index.ts`: The main entry point for the backend server.
*   `public/index.html`: The main entry point for the frontend application.

---

## 🚀 2. Recommended Improvements

This section outlines potential future enhancements for the project.

1.  **Custom Quizzes**: Allow users to create, save, and host their own quizzes by providing a set of questions and answers. This would dramatically increase engagement and replayability.
2.  **More Question Types**: Expand beyond multiple-choice to include other question formats like "type the answer," "true/false," or image-based questions.
3.  **Team Mode**: Introduce a team-based gameplay mode where players can collaborate and compete in groups.
4.  **Spectator Mode**: Add a feature for users to join a game room as a non-participating spectator, which is great for streaming or for users who want to watch friends play.
5.  **Database Migration**: Upgrade the database from SQLite to a more robust, production-grade database like PostgreSQL (especially since a Neon PostgreSQL instance is already available). This would improve scalability, prevent potential file-locking issues under load, and allow for more complex data analysis.

---

## 🤝 3. Agent Handoff Notes

### How to Work on This Project

*   **Deployment**: The application is deployed using **PM2**. The service runs the compiled TypeScript code. To restart the live service after making changes, you must first build the code (`npm run build`) and then restart the service (`pm2 restart quiz-game`).
*   **Development**: To work on the project, you can run the development server using `npm run dev`. This will use `ts-node-dev` to automatically transpile and restart the server when you make changes to the backend code.
*   **Dependencies**: The project uses npm for package management. Add any new dependencies to `package.json` and run `npm install`.
*   **Database**: The database is a simple SQLite file located at `data/quiz-game.db`. If you need to inspect it, you can use a tool like `sqlite3`.
*   **Updating Documentation**: If you make any user-facing changes, update the `INSTRUCTIONS.md` file. If you make architectural changes, update this `AGENTS.md` file.

### What to Watch Out For

*   **Real-time Communication**: The core of the application is the real-time communication handled by Socket.io. Be careful when modifying the event listeners and emitters in `src/server/index.ts` and `public/js/app.js`, as any mismatch can break the game logic.
*   **State Management**: The game state is managed entirely on the server in `gameManager.js`. The client is kept simple and only renders the state it receives from the server. Maintain this separation to avoid bugs.
*   **Native Dependencies**: The project uses `better-sqlite3`, which is a Node.js package with native C++ components. This was the source of the initial deployment issues. While it is now working, be aware that major Node.js version upgrades could potentially cause this dependency to break again.
