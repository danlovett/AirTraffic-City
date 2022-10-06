class Grid {
    constructor(cols, rows, size_of_cell) {
        this.cols = cols;
        this.rows = rows;
        this.grid_size = size_of_cell;
        this.total_grid_size = 10

        //declare grid
        this.grid = [
            ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
            ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["2", "0", "0", "2", "0", "0", "2", "0", "0", "2"],
            ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["2", "1", "1", "1", "1", "1", "1", "1", "0", "2"],
            ["2", "0", "0", "0", "0", "0", "0", "0", "0", "2"],
            ["2", "0", "0", "0", "0", "0", "0", "0", "0", "2"],
            ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["3", "0", "0", "3", "0", "0", "3", "0", "0", "3"],
            ["4", "4", "4", "4", "4", "4", "4", "4", "4", "4"],
        ]
        // declare areas
        this.moveable_areas = [];
        this.spawn_areas = [];
        this.holding_points = [];
        this.runway = [];
        // declare specifics
        this.callsign_prefixses = ['EZY', 'BAW', 'RYR', 'JBE', 'EZE', 'EJU', 'PJS', 'PRIV']
        this.ac_types = ['A320', 'B738', 'B777', 'E145s']
        // game start time
        this.time = [21, 0, 0]
        // standard x1, real time
        this.gameplay_speed = 30
    }

    render() {
        for(let x = 0; x <= this.cols; x++) {
            for(let y = 0; y <= this.rows; y++) {
                noFill()
                noStroke()
                rect(x * this.grid_size, y * this.grid_size, this.grid_size, this.grid_size)
            }
        }
    }

    render_selector_tool(grid_x, grid_y) {
        stroke('white')
        strokeWeight(3)
        noFill()
        rect(grid_x * this.grid_size, grid_y * this.grid_size, this.grid_size, this.grid_size)
        noStroke()
    }

    show_areas() {
        for(let col = 0; col < this.total_grid_size; col++) {
            for(let row = 0; row < this.total_grid_size; row++) {
                if(this.grid[row][col] == "1") fill('blue')
                if(this.grid[row][col] == "2") fill('grey')
                if(this.grid[row][col] == "3") fill('red')
                if(this.grid[row][col] == "4") fill('black')
                if(this.grid[row][col] == "0") fill('green')
                rect(row * this.grid_size, col * this.grid_size, this.grid_size, this.grid_size)
            }
        }
    }

    show_time() {
        textSize(20)
        let time = `${this.time[0] < 10 ? '0' : ''}${this.time[0]}:${this.time[1] < 10 ? '0' : ''}${this.time[1]}:${this.time[2] < 10 ? '0' : ''}${this.time[2]}`
        text(time, 1 * this.grid_size, 11 * this.grid_size)
    }

    update_time() {
        if(frameCount % this.gameplay_speed == 0) {
            if(this.time[0] == 24) {
                this.time[0] = 0
            }
            if(this.time[1] >= 60) {
                this.time[0] = this.time[0] + 1
                this.time[1] = 0
            } else {
                this.time[1]
            }
    
            if(this.time[2] >= 60) {
                this.time[1] = this.time[1] + 1
                this.time[2] = 0
            } else {
                this.time[2] = this.time[2] + 1
            }
        }
    }

    is_a_neighbour(x , y, current_p) {
        let last_vector = planes[current_p].path_to_destination[planes[current_p].path_to_destination.length - 1] || undefined
        if(last_vector[0] + 1 == x || last_vector[1] + 1 == y || last_vector[0] - 1 == x || last_vector[1] - 1 == y) {
            return true
        } else {
            return false
        }
    }

    point_is_valid(x, y) {
        let not_found = true
        // check taxiway
        for(let i = 0; i < this.moveable_areas.length; i++) {
            if(this.moveable_areas[i][0] == x && this.moveable_areas[i][1] == y) {
                not_found = false
                return true
            } 
        }
        // check stands
        for(let j = 0; j < this.spawn_areas.length; j++) {
            if(this.spawn_areas[j][0] == x && this.spawn_areas[j][1] == y) {
                not_found = false
                return true
            } 
        }
        // check hold
        for(let j = 0; j < this.holding_points.length; j++) {
            if(this.holding_points[j][0] == x && this.holding_points[j][1] == y) {
                not_found = false
                return true
            } 
        }

        if(not_found) {
            return false
        }
    }

    end_of_game(plane_one, plane_two) {
        console.log(`${plane_one.callsign} and ${plane_two.callsign} collided.`)
    }
}