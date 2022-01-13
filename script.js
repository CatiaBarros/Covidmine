console.clear();

let size = 15; // size x size tiles
let bombFrequency = 0.62; // percentage of bombs
let tileSize = 40;

const board = document.querySelectorAll('.board')[0];
let tiles;
let boardSize;

const restartBtn = document.querySelectorAll('.btn')[0];
const endscreen = document.querySelectorAll('.endscreen')[0]

// settings
const boardSizeBtn = document.getElementById('boardSize');
const tileSizeBtn = document.getElementById('tileSize');
const difficultyBtns = document.querySelectorAll('.difficulty');

let bombs = [];
let numbers = [];
let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d',];
let endscreenContent = {win: '<span>✔</span> you won!', loose: '🦠 Booom! You got Covid.'};

let gameOver = false;

/* clear board */
const clear = () => {
	// console.clear();
	gameOver = false;
	bombs = [];
	numbers = [];
	endscreen.innerHTML = '';
	endscreen.classList.remove('show');
	tiles.forEach(tile => {
		tile.remove();
	});
	
	setup();
}


/* setup the game */
const setup = () => {
	for (let i = 0; i < Math.pow(size, 2); i++) {
		const tile = document.createElement('div');
		tile.classList.add('tile');
		board.appendChild(tile);
	}
	tiles = document.querySelectorAll('.tile');
	boardSize = Math.sqrt(tiles.length);
	board.style.width = boardSize * tileSize + 'px';
	
	document.documentElement.style.setProperty('--tileSize', `${tileSize}px`);
	document.documentElement.style.setProperty('--boardSize', `${boardSize * tileSize}px`);
	
	let x = 0;
	let y = 0;
	tiles.forEach((tile, i) => {
		// set tile coordinates
		tile.setAttribute('data-tile', `${x},${y}`);

		// add bombs
		let random_boolean = Math.random() < bombFrequency;
		if (random_boolean) {
			bombs.push(`${x},${y}`);
			if (x > 0) numbers.push(`${x-1},${y}`);
			if (x < boardSize - 1) numbers.push(`${x+1},${y}`);
			if (y > 0) numbers.push(`${x},${y-1}`);
			if (y < boardSize - 1) numbers.push(`${x},${y+1}`);
			
			if (x > 0 && y > 0) numbers.push(`${x-1},${y-1}`);
			if (x < boardSize - 1 && y < boardSize - 1) numbers.push(`${x+1},${y+1}`);
			
			if (y > 0 && x < boardSize - 1) numbers.push(`${x+1},${y-1}`);
			if (x > 0 && y < boardSize - 1) numbers.push(`${x-1},${y+1}`);
		}

		x++;
		if (x >= boardSize) {
			x = 0;
			y++;
		}
		
		/* rightclick */
		tile.oncontextmenu = function(e) {
			e.preventDefault();
			flag(tile);
		}
		
		/* leftclick */
		tile.addEventListener('click', function(e) {
			clickTile(tile);
		});
	});
	
	numbers.forEach(num => {
		let coords = num.split(',');
		let tile = document.querySelectorAll(`[data-tile="${parseInt(coords[0])},${parseInt(coords[1])}"]`)[0];
		let dataNum = parseInt(tile.getAttribute('data-num'));
		if (!dataNum) dataNum = 0;
		tile.setAttribute('data-num', dataNum + 1);
	});
}


/* flag a tile */
const flag = (tile) => {
	if (gameOver) return;
	if (!tile.classList.contains('tile--checked')) {
		if (!tile.classList.contains('tile--flagged')) {
			tile.innerHTML = '💉';
			tile.classList.add('tile--flagged');
		} else {
			tile.innerHTML = '';
			tile.classList.remove('tile--flagged');
		}
	}
}


/* check if bomb or not */
const clickTile = (tile) => {
	if (gameOver) return;
	if (tile.classList.contains('tile--checked') || tile.classList.contains('tile--flagged')) return;
	let coordinate = tile.getAttribute('data-tile');
	if (bombs.includes(coordinate)) {
		endGame(tile);
	} else {
		/* check if nearby bomb */
		let num = tile.getAttribute('data-num');
		if (num != null) {
			tile.classList.add('tile--checked');
			tile.innerHTML = num;
			tile.style.color = numberColors[num-1];
			setTimeout(() => {
				checkVictory();
			}, 100);
			return;
		}
		
		checkTile(tile, coordinate);
	}
	tile.classList.add('tile--checked');
}


/* clicked the right one */
const checkTile = (tile, coordinate) => {
	
	console.log('✔');
	let coords = coordinate.split(',');
	let x = parseInt(coords[0]);
	let y = parseInt(coords[1]);
	
	/* check nearby tiles */
	setTimeout(() => {
		if (x > 0) {
			let targetW = document.querySelectorAll(`[data-tile="${x-1},${y}"`)[0];
			clickTile(targetW, `${x-1},${y}`);
		}
		if (x < boardSize - 1) {
			let targetE = document.querySelectorAll(`[data-tile="${x+1},${y}"`)[0];
			clickTile(targetE, `${x+1},${y}`);
		}
		if (y > 0) {
			let targetN = document.querySelectorAll(`[data-tile="${x},${y-1}"]`)[0];
			clickTile(targetN, `${x},${y-1}`);
		}
		if (y < boardSize - 1) {
			let targetS = document.querySelectorAll(`[data-tile="${x},${y+1}"]`)[0];
			clickTile(targetS, `${x},${y+1}`);
		}
		
		if (x > 0 && y > 0) {
			let targetNW = document.querySelectorAll(`[data-tile="${x-1},${y-1}"`)[0];
			clickTile(targetNW, `${x-1},${y-1}`);
		}
		if (x < boardSize - 1 && y < boardSize - 1) {
			let targetSE = document.querySelectorAll(`[data-tile="${x+1},${y+1}"`)[0];
			clickTile(targetSE, `${x+1},${y+1}`);
		}
		
		if (y > 0 && x < boardSize - 1) {
			let targetNE = document.querySelectorAll(`[data-tile="${x+1},${y-1}"]`)[0];
			clickTile(targetNE, `${x+1},${y-1}`);
		}
		if (x > 0 && y < boardSize - 1) {
			let targetSW = document.querySelectorAll(`[data-tile="${x-1},${y+1}"`)[0];
			clickTile(targetSW, `${x-1},${y+1}`);
		}
	}, 10);
}


/* Bomb clicked -> end game */
const endGame = (tile) => {
	console.log('🦠 Booom! Game over.');
	endscreen.innerHTML = endscreenContent.loose;
	endscreen.classList.add('show');
	gameOver = true;
	tiles.forEach(tile => {
		let coordinate = tile.getAttribute('data-tile');
		if (bombs.includes(coordinate)) {
			tile.classList.remove('tile--flagged');
			tile.classList.add('tile--checked', 'tile--bomb');
			tile.innerHTML = '🦠';
		}
	});
}

const checkVictory = () => {
	let win = true;
	tiles.forEach(tile => {
		let coordinate = tile.getAttribute('data-tile');
		if (!tile.classList.contains('tile--checked') && !bombs.includes(coordinate)) win = false;
	});
	if (win) {
		endscreen.innerHTML = endscreenContent.win;
		endscreen.classList.add('show');
		gameOver = true;
	}
}


/* start game */
setup();

/* click button for new game */
restartBtn.addEventListener('click', function(e) {
	e.preventDefault();
	clear();
});

// settings
boardSizeBtn.addEventListener('change', function(e) {
	console.log(this.value);
	size = this.value;
	clear();
});

tileSizeBtn.addEventListener('change', function(e) {
	console.log(this.value);
	tileSize = this.value;
	clear();
});

difcencultyBtns.forEach(btn => {
	btn.addEventListener('click', function() {
		console.log(this.value);
		bombFrequency = this.value;
		clear();
	});
});

console.log(`${boardSize} x ${boardSize} tiles`);
console.log('bombs');
console.log(bombs);
console.log('numbers');
console.log(numbers);