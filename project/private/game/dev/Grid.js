class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid_size = 60;
        this.total_grid_size = 12

        //declare grid
        this.grid = [
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
        ];

        this.buttons = [createButton(`stand`), createButton(`terminal`), createButton(`taxiway`), createButton(`holdpoint`), createButton(`runway#`), createButton(`runway`), createButton(`control tower`),];
        this.tools = ["1", "6", "2", "3", "5", "4", "7"]
        this.tool;
        this.color = color('green')
        this.colors = [color('blue'), color('orange'), color('grey'), color('pink'), color('yellow'), color('black'), color('red')]

    }

    render() {
        for(let row = 0; row < this.total_grid_size; row++) {
            for(let col = 0; col < this.total_grid_size; col++) {
                if(this.grid[row][col] == "1") fill(this.colors[0]) // stands
                if(this.grid[row][col] == "2") fill(this.colors[2]) // taxiway
                if(this.grid[row][col] == "3") fill(this.colors[3]) // holding points
                if(this.grid[row][col] == "4") fill(this.colors[5]) // runway || runway entry point
                if(this.grid[row][col] == "5") fill(this.colors[4]) // runway || runway entry point
                if(this.grid[row][col] == "6") fill(this.colors[1]) // terminal points
                if(this.grid[row][col] == "7") fill(this.colors[6]) // control tower points
                if(this.grid[row][col] == "0") noFill() // grass
                rect(row * this.grid_size, col * this.grid_size, this.grid_size, this.grid_size)

            }
        }
        for(let x = 0; x <= this.cols; x++) {
            for(let y = 0; y <= this.rows; y++) {
                noFill()
                strokeWeight(3)
                rect(x * this.grid_size, y * this.grid_size, this.grid_size, this.grid_size)

            }
        }
    }

    render_selector_tool(grid_x, grid_y) {
        stroke('yellow')
        strokeWeight(3)
        fill(this.color)
        rect(grid_x * this.grid_size, grid_y * this.grid_size, this.grid_size, this.grid_size)
        stroke('grey')
        noFill()
    }

    makeButtons() {
        let button_pos_x = 0.5
        for(let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].position(button_pos_x * this.grid_size, 13.5 * this.grid_size)
            button_pos_x = button_pos_x + 1.5
        }
    }

    buttonPress() {
        for(let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].mousePressed(() => {
                this.tool = this.tools[i]
                this.color = this.colors[i]
            })
        }

        for(let index = 0; index < this.buttons.length; index++) {
            if(this.tools[index] == this.tool) {
                this.buttons[index].style('background-color', 'white')
                this.buttons[index].style('color', 'black')
            } else {
                this.buttons[index].style('background-color', 'black')
                this.buttons[index].style('color', 'white')
            }
        }
    }

    update(x, y) {
        this.grid[x][y] = this.tool
    }
}