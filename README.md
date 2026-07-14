# Pod Racer Sim

A browser-based racing game built to practise real-world asynchronous JavaScript: `fetch`, Promises, `async`/`await`, polling with `setInterval`, and error handling — all wired up to a live backend API with no frontend framework.

Pick a track and a racer, start the race, and mash the accelerate button while a leaderboard live-updates from the server until the race finishes and results are displayed.

> Originally built as Project 3 for Udacity's Intermediate JavaScript Nanodegree ("Asynchronous Programming in JavaScript"). The scaffolding (HTML views, styling, binary game-engine API) was provided by Udacity; the async client logic — API calls, race flow control, polling, countdown, and error handling — is my implementation. Starter code: https://github.com/udacity/nd032-c3-asynchronous-programming-with-javascript-project-starter

## How it works

1. **Home / setup view** — fetches the list of tracks and racers from the API and renders them as selectable cards.
2. **Create race** — posts the chosen player and track to the API, kicks off a countdown, then starts the race.
3. **Race progress view** — polls the API every 500ms for race state and re-renders a live leaderboard (position, driver, segment, speed) while the player accelerates by clicking a button.
4. **Results view** — once the API reports the race as finished, renders the final standings.

## Stack

- **Frontend:** vanilla JavaScript (no framework), HTML, CSS — DOM rendering via template strings, `fetch` for all API I/O
- **Backend:** [Express](https://expressjs.com/) server serving the static frontend
- **Game engine:** a precompiled binary API (provided, not editable) exposing tracks/cars/race endpoints, run as a separate process
- **Tooling:** Prettier for formatting, Yarn/npm for package management

## Setup

Requires Node.js and Yarn (or npm).

```bash
git clone https://github.com/briancornally/prj-racer.git
cd prj-racer
yarn install   # or: npm install
```

### 1. Start the game engine API

The API is a precompiled binary in `bin/` — pick the command for your OS and run it from the project root:

| OS      | Command                                                               |
| ------- | ---------------------------------------------------------------------|
| macOS   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-darwin-amd64`      |
| Windows | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-windows-amd64.exe` |
| Linux   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-linux-amd64`       |

On Windows, set the data file location first: `set DATA_FILE=./data.json`

This serves the race API on `http://localhost:3001`.

### 2. Start the frontend

In a second terminal, from the project root:

```bash
yarn start   # or: npm start
```

Then open **http://localhost:3000**.

## API reference

| Endpoint                    | Method | Description                     |
| ---------------------------- | ------ | -------------------------------- |
| `/api/tracks`                | GET    | List all tracks                  |
| `/api/cars`                  | GET    | List all racers                  |
| `/api/races/:id`             | GET    | Get status/positions for a race  |
| `/api/races`                 | POST   | Create a race                    |
| `/api/races/:id/start`       | POST   | Start a race                     |
| `/api/races/:id/accelerate`  | POST   | Accelerate the player's car      |

## License

Educational content originally provided by Udacity under their Nanodegree terms (see [LICENSE](LICENSE)); the implementation code above is my own work.
