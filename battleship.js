const difficultyMap=new Map();
difficultyMap.set("easy", {boardSize:5, ships: [2, 3], numShips: 2});
difficultyMap.set("medium", {boardSize:8, ships: [2, 3, 4], numShips: 3});
difficultyMap.set("hard", {boardSize:10, ships: [3, 4, 4, 5], numShips: 4});
const board=document.getElementById("table")
const radioButtons = document.getElementById("radio-buttons").elements["difficulty"]
const messageArea = document.getElementById("messageArea")
var highestIdx = 0
var isShipHere = []
var attempts = 0;
var listOfShips = []
const explosionSE= new Audio("DeathFlash.wav")
explosionSE.volume = 0.7
const splashSE= new Audio("watersplash.wav")
splashSE.volume = 0.7
const winSE = new Audio("youWon.wav")

function generateBoard(){
	var difficulty = difficultyMap.get(radioButtons.value)
	size=difficulty.boardSize
	board.innerHTML=""
	let idx = 0;

	for (let i = 0; i < size; i++){
		var row = "<tr>";

		for(let j = 0; j < size; j++){
			row +=`<td id=\"${idx}\"></td>`
			idx++;
			isShipHere.push(false)
		}

		board.innerHTML += row;
	}
	highestIdx=idx
	generateShips()
	addEventListeners()
}


function generateShips(){
	attempts++
	var difficulty = difficultyMap.get(radioButtons.value)
	var listOfShipsTemp = []
	for (ship of difficulty.ships){
		var shipLocations = []
		var isShipGood = false
		var iteration = 0
		while(!isShipGood){
			shipLocations = []
			var firstIdx = getRndInteger(0, highestIdx+1)
			while (isShipHere[firstIdx]){
				firstIdx = getRndInteger(0, highestIdx+1)
			}
			isShipHere[firstIdx] = true
			shipLocations.push(firstIdx)

			var direction = getRndInteger(0, 4)
			var idxJumpAmount = 1
			switch(direction){
				case 0:
					idxJumpAmount = 1
					break
				case 1:
					idxJumpAmount = -difficulty.boardSize
					break
				case 2:
					idxJumpAmount = -1
					break
				case 3:
					idxJumpAmount = difficulty.boardSize
					break
				default:
					idxJumpAmount = 1
			}
			currentIdx = firstIdx + idxJumpAmount
			for(let i = 0; i < ship - 1; i++){
				isShipGood = !isShipHere[currentIdx]
				if (!isShipGood){
					continue
				}
				shipLocations.push(currentIdx)
				currentIdx += idxJumpAmount
			}
			if(direction==0 || direction == 2){
				var startingRow = roundDownToNearestMult(firstIdx, difficulty.boardSize)
				var endRow = roundDownToNearestMult(currentIdx, difficulty.boardSize)
				isShipGood = startingRow==endRow
				if (!isShipGood){
					continue
				}
			}
			if (currentIdx < 0 || currentIdx > highestIdx){
				isShipGood = false
				continue
			}
			iteration++ 
			if (iteration > 50){
				isShipGood = false
				break
			}
		}


		if (!isShipGood || shipLocations.length != ship){
			if (attempts < 100) {
				generateShips()
			}
			else {
				console.log("failed too many times")
			}
			return
		}

		listOfShipsTemp.push({ length: ship, locations: shipLocations })
	}
	
	for(i = 0; i < isShipHere.length; i++){
		isShipHere[i] = false
	}

	for (placedShip of listOfShipsTemp) {
		console.log("Ship " + placedShip.length)
		for(idx of placedShip.locations){
			isShipHere[idx] = true
			console.log(idx)
		}
		var shipToAdd = {length: placedShip.length, locations: placedShip.locations, isSunk: false, numHits: 0}
		listOfShips.push(shipToAdd)
	}
}

function roundDownToNearestMult(number, mult){
	let quo = Math.floor(number/mult);
	let multipleOfMult = mult * quo;
	return multipleOfMult;
}

function getRndInteger(min, max){
	return Math.floor(Math.random() * (max-min)) + min;
}

function addEventListeners(){
	var boxes = document.getElementsByTagName("td")
	for(box of boxes){
		box.addEventListener("click", (event) => {
			fire(event.target)
		})
	}
}

function fire(element){
	var locationId = parseInt(element.id)
	if (isShipHere[locationId]){
		element.classList.add("hit")
		playExplosionSE()
		messageArea.innerHTML = "BOOM, that's a hit!"
		for(ship of listOfShips){
			if(ship.locations.includes(locationId)){
				ship.numHits++; 
				if(ship.numHits >= ship.length){
					ship.isSunk= true
					messageArea.innerHTML = "BOOM, you have sunk a ship"
				}
				break
			}
		}
		checkShips()
	}
	else{
		element.classList.add("miss")
		playSplashSE()
		messageArea.innerHTML = "Splash, you missed!"
	}
}
function checkShips(){
	var allShipsSunk = true
	for (ship of listOfShips){
		if((!ship.isSunk)){
			allShipsSunk = false
		}
	}
	if (allShipsSunk){
		messageArea.innerHTML = "Congratulations, all ships have been sunk"
		playWinSE()
	}
}

function playExplosionSE(){
	explosionSE.play()
}

function playSplashSE(){
	splashSE.play()
}

function playWinSE(){
	winSE.play()
}