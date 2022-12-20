// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
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
		console.log('Problem getting tracks and racers ::', error.message);
		console.error(error);
	}
}

function setupClickHandlers() {
	document.addEventListener(
		'click',
		function (event) {
			const { target } = event;

			// Race track form field
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
				handleAccelerate();
			}
		},
		false
	);
}

async function delay(ms) {
	try {
		return await new Promise((resolve) => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here");
		console.log(error);
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// TODO - Get player_id and track_id from the store
	const player_id = store.player_id;
	console.log('player_id', player_id);
	const track_id = store.track_id;
	console.log('track_id', track_id);

	// const race = TODO - invoke the API call to create the race, .then save the result
	const raceObj = await createRace(player_id, track_id);
	console.log('raceObj', raceObj);

	// TODO - update the store with the race id
	// For the API to work properly, the race id should be race id - 1
	try {
		const race_id = raceObj.ID - 1;
		store.race_id = race_id;
		console.log('race_id', race_id);
	} catch (err) {
		console.log('Problem with handleCreateRace: raceObj.ID', err);
	}

	const Track = raceObj.Track;
	console.log('Track', Track);

	const Racers = raceObj.Cars;
	console.log('Racers', Racers);

	// render starting UI
	renderAt('#race', renderRaceStartView(Track, Racers));

	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown();

	// TODO - call the async function startRace
	await startRace(race_id);

	// TODO - call the async function runRace
	runRace(race_id);
	console.log();
}

function runRace(raceID) {
	return new Promise((resolve) => {
		// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(() => {
			getRace(raceID).then((raceInfo) => {
				console.log('raceInfo', raceInfo);
				console.log();
				let status = undefined;
				try {
					status = raceInfo.status;
				} catch (err) {
					console.log('Problem with runRace raceInfo.status', err);
				}
				if (status === 'in-progress') {
					renderAt('#leaderBoard', raceProgress(raceInfo.positions));
				}
				if (status === 'finished') {
					clearInterval(raceInterval); // to stop the interval from repeating
					renderAt('#race', resultsView(raceInfo.positions)); // to render the results view
					resolve(raceInfo); // resolve the promise
				}
			});
		}, 500);

		/*
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
	*/
		/*
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		resolve(res) // resolve the promise
	*/
	});
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000);
		let timer = 3;

		return new Promise((resolve) => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const countdownInterval = setInterval(() => {
				// console.log(timer);
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer;
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if (timer === 0) {
					clearInterval(countdownInterval);
					resolve();
					return;
				}
			}, 1000);
		});
	} catch (error) {
		console.log(error);
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
	// TODO - save the selected racer to the store
	try {
		store.player_id = parseInt(target.id);
	} catch (error) {
		console.log(error);
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

	// TODO - save the selected track id to the store
	try {
		store.track_id = parseInt(target.id);
	} catch (error) {
		console.log(error);
	}
}

function handleAccelerate() {
	console.log('accelerate button clicked');
	// TODO - Invoke the API call to accelerate
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

function renderRaceStartView(track, racers) {
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
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
	let userPlayer = positions.find((e) => e.id === store.player_id);
	console.log('userPlayer', userPlayer);
	userPlayer.driver_name += ' (you)';

	positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
	console.log('positions', positions);
	let count = 1;

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
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
			<h4>position - driver - segment - speed</h4>
				${results}
			</section>
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

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
		.then((res) => res.json())
		.catch((err) => {
			console.log('Problem with getTracks request::', err);
		});
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
		.then((res) => res.json())
		.catch((err) => {
			console.log('Problem with getRacers request::', err);
		});
}

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
		.then((res) => res.json())
		.catch((err) => {
			console.log('Problem with createRace request::', err);
		});
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
		.then((res) => res.json())
		.catch((err) => {
			console.log('Problem with getRace request::', err);
		});
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then((res) => {
			console.log(res.status);
			console.log(res);
			if (!res.ok) {
				throw new Error('HTTP status ' + res.status);
			}
		})
		.catch((err) => {
			console.log('Problem with startRace request::', err);
		});
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	console.log('id', id);
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then((res) => {
			console.log(res.status);
			console.log(res);
			if (!res.ok) {
				throw new Error('HTTP status ' + res.status);
			}
		})
		.catch((err) => {
			console.log('Problem with accelerate request::', err);
		});
}
