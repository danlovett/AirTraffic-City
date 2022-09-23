let gridX, gridY
let tiles = []
let drawDirArray = ['horizontal', 'vertical', 'horizontal', 'vertical']
let drawDirCurrentIndex = 0
let deleteMode = false
let cellSize = 100

let thisInfo = []
let otherInfo = []

function setup() {
	createCanvas(windowWidth, windowHeight)
}

function draw() {
	// reset stroke
	stroke('black')

	// defining global variables
	gridX = floor(mouseX / cellSize)
	gridY = floor(mouseY / cellSize)

	background('green')

	// updating all tiles and their properties
	for (let i = 0; i < tiles.length; i++) {
		tiles[i].update()
		// checking for omnidirectional ways of tavel
	}

    // let ui_instance = new UI();
}

function keyPressed() {
	// r will rotate the tile (increment array index by one and read the rotation)
	// d will switch between deleting mode and not deleting mode
	// u will remove last entity in array [.pop()]
	if (key == 'r') {
		drawDirCurrentIndex != drawDirArray.length - 1 ? drawDirCurrentIndex++ : drawDirCurrentIndex = 0
	} else if (key == 'd') {
		deleteMode = !deleteMode
	} else if (key == 'u') {
		tiles.pop()
	}
}

function mousePressed() {
	if (mouseButton === LEFT && deleteMode == false) {
		tiles.push(new Tile(drawDirArray[drawDirCurrentIndex]))
		tiles[tiles.length - 1].show(gridX, gridY)
	} else if (mouseButton == LEFT && deleteMode == true) {
		//delete tile at GridX GridY
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
}