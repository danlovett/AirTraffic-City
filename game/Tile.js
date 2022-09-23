let number = 20
class Tile {
    constructor(directionalDrawing) {
        this.lineWeight = 3;
        this.gridX;
        this.gridY;
        this.centreline = null;
        this.drawDir = directionalDrawing;
        this.properties = [this.centreline, this.right, this.left, this.top, this.bottom]
    
        //borders
        this.right = (this.gridX * cellSize + cellSize, this.gridY * cellSize, this.gridX * cellSize + cellSize, this.gridY * cellSize + cellSize)
        this.left = (this.gridX * cellSize, this.gridY * cellSize, this.gridX * cellSize, this.gridY * cellSize + cellSize)
        this.top = (this.gridX * cellSize, this.gridY * cellSize, this.gridX * cellSize + cellSize, this.gridY * cellSize)
        this.bottom = (this.gridX * cellSize, this.gridY * cellSize + cellSize, this.gridX * cellSize + cellSize, this.gridY * cellSize + cellSize)
        this.properties = [this.centreline, this.top, this.right, this.bottom, this.left]
    }

    show(gridX, gridY) {
        this.gridX = gridX,
        this.gridY = gridY
    }

    update() { // neighbour
        // set stroke properties
        noStroke()
        strokeWeight(this.lineWeight)
        stroke('yellow')
        if(this.drawDir == 'horizontal') {
            this.centreline = line(this.gridX * cellSize, this.gridY * cellSize + (cellSize/2), 
                this.gridX * cellSize + cellSize, this.gridY * cellSize + (cellSize/2))
        } else if (this.drawDir == 'vertical') {
            stroke('yellow')
            this.centreline = line(this.gridX * cellSize + (cellSize / 2), this.gridY * cellSize,
                this.gridX * cellSize + (cellSize/2), this.gridY * cellSize + cellSize)
        }
        // revert to default stroke properties
        stroke('black')
        strokeWeight(1)
    }

    isOverlapping() {
        if(tiles.length != 0) {
            for(let i = 0; i < tiles.length; i++) {
                if(tiles[i].gridX == this.gridX && tiles[i].gridY == this.gridY && tiles[i] != this) {
                    textSize(30)
					// DEBUG
                    text('overlap', this.gridX * cellSize, this.gridY * cellSize + (cellSize/2))
                    textSize(10)
                    return true
                }
            }
        }
    }

    twoWayCornerCheck() {
        let leftTile = [this.gridX - 1, this.gridY]
        let rightTile = [this.gridX + 1, this.gridY]
        let aboveTile = [this.gridX, this.gridY + 1]
        let belowTile = [this.gridX, this.gridY - 1]
        for(let tile of tiles) {
            if([tile.gridX, tile.gridY] == leftTile) {
                //text('left', tile.gridX * cellSize, tile.gridY * cellSize + (cellSize/2))
                return 'left'
            } else if([tile.gridX, tile.gridY] == rightTile) {
                //text('right', tile.gridX * cellSize, tile.gridY * cellSize + (cellSize/2))
                return 'right'
            } else if([tile.gridX, tile.gridY] == aboveTile) {
                //text('above', tile.gridX * cellSize, tile.gridY * cellSize + (cellSize/2))
                return 'above'
            } else if([tile.gridX, tile.gridY] == belowTile) {
                //text('below', tile.gridX * cellSize, tile.gridY * cellSize + (cellSize/2))
                return 'below'
            } else {
                return false
            }

            number = number + 20
        }
    }

    threeWayCheck() {

    }

    fourWayCheck() {

    }

    //otherwise just straight line









}