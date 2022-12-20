// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	player_id: undefined,
	race_id: undefined,
	status: undefined, // to ignore accelerate clicks until race in-progress
	track_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	onPageLoad();
	setupClickHandlers();
});

async function onPageLoad() {
	try {
		getTracks().then((tracks) => {
			const html = renderTrackCards(tracks);
			renderAt('#tracks', html);
		});

		getRacers().then((racers) => {
			const html = renderRacerCars(racers);
			renderAt('#racers', html);
		});
	} catch (error) {
		console.log('onPageLoad: Problem getting tracks and racers', error.message);
		console.error(error);
	}
}

function setupClickHandlers() {
	document.addEventListener(
		'click',
		function (event) {
			const { target } = event;

			// Race track form field
			// target.matches didn't work in my browser
			if (target.parentElement.matches('.card.track')) {
				handleSelectTrack(target.parentElement);
			}

			// Podracer form field
			if (target.parentElement.matches('.card.podracer')) {
				handleSelectPodRacer(target.parentElement);
			}

			// Submit create race form
			if (target.matches('#submit-create-race')) {
				event.preventDefault();

				// start race
				handleCreateRace();
			}

			// Handle acceleration click
			if (target.matches('#gas-peddle')) {
				// to ignore accelerate clicks until race in-progress
				if (store.status === 'in-progress') {
					handleAccelerate();
				}
			}
		},
		false
	);
}

async function delay(ms) {
	try {
		return await new Promise((resolve) => setTimeout(resolve, ms));
	} catch (error) {
		console.log("delay :: an error shouldn't be possible here");
		console.error(error);
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

/**
 * @description notify user if value is unset
 * @param {string} name - the variable name
 * @param {number} value - the value
 */
function notifyUnset(name, value) {
	if (!value) {
		let notify = document.getElementById('notify');
		notify.innerHTML = 'Please choose a ' + name.split('_')[0];
		notify.style.display = 'block';
		return true;
	} else {
		return false;
	}
}

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	const player_id = store.player_id;
	const track_id = store.track_id;
	if (notifyUnset('player_id', player_id) || notifyUnset('track_id', track_id)) {
		return;
	}

	try {
		const raceInfo = await createRace(player_id, track_id);
		const race_id = raceInfo.ID - 1;
		const track = raceInfo.Track;
		store.race_id = race_id;
		renderAt('#race', renderRaceStartView(track));
		await runCountdown();
		await startRace(race_id);
		runRace(race_id);
	} catch (error) {
		console.error('handleCreateRace::error', error);
	}
}

function runRace(raceID) {
	return new Promise((resolve) => {
		const raceInterval = setInterval(async () => {
			try {
				const raceInfo = await getRace(raceID);
				const status = raceInfo.status;
				store.status = status;
				if (status === 'in-progress') {
					renderAt('#leaderBoard', raceProgress(raceInfo.positions));
				} else if (status === 'finished') {
					clearInterval(raceInterval); // to stop the interval from repeating
					renderAt('#race', resultsView(raceInfo.positions)); // to render the results view
					resolve(raceInfo); // resolve the promise
				} else {
					// stop the interval if encounter error
					clearInterval(raceInterval); // to stop the interval from repeating
					console.log('runRace: unexpected status', status);
					resolve(raceInfo); // resolve the promise
				}
			} catch (error) {
				console.error('runRace::error', error);
				clearInterval(raceInterval); // to stop the interval from repeating
			}
		}, 500);
	});
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000);
		let timer = 3;

		return new Promise((resolve) => {
			const countdownInterval = setInterval(() => {
				document.getElementById('big-numbers').innerHTML = --timer;
				if (timer === 0) {
					clearInterval(countdownInterval);
					resolve();
				}
			}, 1000);
		});
	} catch (error) {
		console.log('runCountdown::error', error);
	}
}

function handleSelectPodRacer(target) {
	console.log('selected a pod', target.id);

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected');
	if (selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');

	// save the selected racer to the store
	try {
		const player_id = parseInt(target.id);
		store.player_id = player_id;
	} catch (error) {
		console.error('handleSelectPodRacer::error', error);
	}
}

function handleSelectTrack(target) {
	console.log('selected a track', target.id);

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected');
	if (selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');

	// save the selected track id to the store
	try {
		const track_id = parseInt(target.id);
		store.track_id = track_id;
	} catch (error) {
		console.error('handleSelectTrack::error', error);
	}
}

function handleAccelerate() {
	console.log('accelerate button clicked');
	// Invoke the API call to accelerate
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`;
	}

	const results = racers.map(renderRacerCard).join('');

	return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer;

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`;
	}

	const results = tracks.map(renderTrackCard).join('');

	return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
	const { id, name } = track;

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<br>
			<center>
				<h3>
					<a href="/race">Start a new race</a>
				</h3>
			</center>
		</main>
	`;
}

function raceProgress(positions) {
	let userPlayer = positions.find((e) => e.id === store.player_id);
	if (userPlayer === undefined) {
		console.log('raceProgress::userPlayer not found');
		return;
	}
	userPlayer.driver_name += ' (you)';

	positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
	let count = 1;

	// added information to leader board - for more entertainment
	const results = positions.map((p) => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name} - <strong>${p.segment}<strong> - <i>${p.speed}</i></h3>
				</td>
			</tr>
		`;
	});

	return `
		<main>
			<center>
				<h2>Leaderboard</h2>

				<section id="leaderBoard">
					<h3><i><strong>position - driver - segment - speed</strong></i></h3>
					<br>
						${results}
				</section>
			</center>
		</main>
	`;
}

function renderAt(element, html) {
	const node = document.querySelector(element);

	node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:3001';

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	};
}

// Call API endpoints

/**
 * @description test if response is ok
 * @param {object} response - the name of the invoking function
 */
function testResponseOk(response) {
	if (response.ok) {
		return response;
	} else {
		throw new Error('testResponseOk', response);
	}
}

/**
 * @description test if response is json & call json promise
 * @param {object} response - the name of the invoking function
 */
function testResponseJson(response) {
	try {
		return response.json();
	} catch {
		throw new Error('testResponseJson', response);
	}
}

/**
 * @description general function to write log on error
 * @param {string} name - the name of the invoking function
 * @param {object} error - the error stack
 */
function consoleError(name, error) {
	console.log(`${name}::error.message`, error.message);
	console.error(error);
}

/**
 * @description call API to get tracks info for display selection
 * @param {number} id - race_id
 */
function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
		.then((response) => testResponseOk(response))
		.then((response) => testResponseJson(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}

/**
 * @description call API to get racers info for display selection
 * @param {number} id - race_id
 */
function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
		.then((response) => testResponseOk(response))
		.then((response) => testResponseJson(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}

/**
 * @description call API to create race
 * @param {number} id - race_id
 */
function createRace(player_id, track_id) {
	player_id = parseInt(player_id);
	track_id = parseInt(track_id);
	const body = { player_id, track_id };

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body),
	})
		.then((response) => testResponseOk(response))
		.then((response) => testResponseJson(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}

/**
 * @description call API to get race info
 * @param {number} id - race_id
 */
function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
		.then((response) => testResponseOk(response))
		.then((response) => testResponseJson(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}

/**
 * @description call API to start race
 * @param {number} id - race_id
 */
function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then((response) => testResponseOk(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}

/**
 * @description call API to accelerate
 * @param {number} id - race_id
 */
function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then((response) => testResponseOk(response))
		.catch((error) => {
			consoleError(arguments.callee.name, error);
		});
}
