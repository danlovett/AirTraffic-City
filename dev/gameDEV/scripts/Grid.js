class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid_size = 60;
        this.total_grid_size = 12

        //declare grid
        this.grid = [
            ["5", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5"],
            ["3", "0", "0", "0", "3", "0", "0", "0", "0", "0", "0", "3"],
            ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["0", "0", "0", "2", "0", "0", "0", "0", "2", "0", "0", "0"],
            ["0", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["0", "2", "1", "1", "1", "6", "6", "6", "1", "1", "1", "2"],
            ["0", "2", "6", "6", "6", "6", "7", "6", "6", "6", "6", "2"],
            ["0", "2", "1", "1", "1", "6", "6", "6", "1", "1", "1", "2"],
            ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
            ["3", "0", "0", "3", "0", "0", "0", "0", "3", "0", "0", "3"],
            ["5", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "5"],
            ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
        ]
        // declare areas
        this.grass_areas = [];
        this.moveable_areas = [];
        this.spawn_areas = [];
        this.stands = [];
        this.holding_points = [];
        this.holding_point_names = [];
        this.runway = [];
        this.runway_entry = [];
        this.control_tower = [];
        // declare specifics
        this.runway_numbers = ['18 R', '36 L', '18 L', '36 R']
        this.callsign_prefixses = [['LXG', 'EGLL'], ['BLE', 'EGGW'], ['EZY', 'EGGW', 'EGCC', 'EGKK'], ['BAW', 'EGLL', 'EGKK', 'EGCC'], ['RYR', 'EGCC', 'EGSS', 'EGKK'], ['VLG', 'EGLL', 'EGKK'], ['PR', 'EGSS'], ['G-E', 'EGKK'], ['B-RT', 'EGLL', 'EGCC'], ['LIN', 'EGGW'], ['FBE', 'EGGW'], ['CGG', 'EGLL', 'EGKK']]
        this.ac_types = [['A320', 'LM'], ['B738', 'LM'], ['B777', 'H'], ['E145s', 'S'], ['B752', 'UM'], ['A220', 'LM'], ['P28A', 'L']]
        this.destinations = ['LXGB', 'EDDF', 'EDDM', 'LFPG', 'LFRS', 'EGSL', 'EGPH', 'EGGW', 'EGPE', 'EGPF', 'EGGD', 'EGGP']
        this.airport = 'EGLL'
        // game start time

        this.gameplay_play = true
        
        this.time = [23, 30, 0]
        this.time_to_mins = 0;
        this.gameplay_speed = 30 // lower val = faster, higher val = slower default = 30

        this.color_grass = color(100, 250, 70)
        this.color_stand = color(70, 70, 70) 
        this.color_terminal = color(255,127,80)
        this.color_control_tower = color(2111, 143, 175)
        this.color_taxiway = color(100, 100, 100)
        this.color_holding_point = color(50, 50, 50)
        this.color_runway = color(0, 0, 0)

        this.play_pause_button = createButton(`play/pause`)
        this.speed_one_button = createButton(`x1`)
        this.speed_two_button = createButton(`x2`)
        this.speed_five_button = createButton(`x5`)
        this.speed_ten_button = createButton(`x10`)

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
        stroke('blue')
        strokeWeight(3)
        noFill()
        rect(grid_x * this.grid_size, grid_y * this.grid_size, this.grid_size, this.grid_size)
        noStroke()
    }

    show_areas() {
        // showing all areas with colours
        for(let row = 0; row < this.total_grid_size; row++) {
            for(let col = 0; col < this.total_grid_size; col++) {
                if(this.grid[row][col] == "1") fill(this.color_stand) // stands
                if(this.grid[row][col] == "2") fill(this.color_taxiway) // taxiway
                if(this.grid[row][col] == "3") fill(this.color_holding_point) // holding points
                if(this.grid[row][col] == "4" || this.grid[row][col] == "5") fill(this.color_runway) // runway || runway entry point
                if(this.grid[row][col] == "6") fill(this.color_terminal) // terminal points
                if(this.grid[row][col] == "7") fill(this.color_control_tower) // control tower points
                if(this.grid[row][col] == "0") fill(this.color_grass) // grass
                rect(row * this.grid_size, col * this.grid_size, this.grid_size, this.grid_size)
                fill('white')

            }
        }
        // stands
        for(let i = 0; i < this.stands.length; i++) {
            text(i + 1, this.stands[i][0] * this.grid_size + (this.grid_size-35), this.stands[i][1] * this.grid_size + (this.grid_size-35))
        }

        // text setup for numbers runway
        textSize(20)
        // runway numbers
        for(let i = 0; i < this.runway_entry.length; i++) {
            text(this.runway_numbers[i], this.runway_entry[i][0] * this.grid_size + (this.grid_size/7), this.runway_entry[i][1] * this.grid_size + (this.grid_size/2))
        }
        // hp numbers
        textSize(15)
        for(let i = 0; i < this.holding_points.length; i++) {
            text(`${char(i + 65)}1`, this.holding_points[i][0] * this.grid_size + (this.grid_size/7), this.holding_points[i][1] * this.grid_size + (this.grid_size/2))
        }

        // ATC tower
        text('Tower', this.control_tower[0] * this.grid_size + 10, this.control_tower[1] * this.grid_size + 30)
    }

    time_now() {
        if(this.gameplay_play == true) {
            if(frameCount % this.gameplay_speed == 0) {
                // hours
                if(this.time[0] >= 23 && this.time[1] >= 59 && this.time[2] >= 59) {
                    this.time[0] = 0
                } else if (this.time[1] >= 59 && this.time[2] >= 59) {
                    this.time[0] = this.time[0] + 1
                }
    
                // minutes
                if(this.time[1] >= 59 && this.time[2] >= 59) {
                    this.time[1] = 0
                } else if (this.time[2] == 59) {
                    this.time[1] = this.time[1] + 1
                }
                
                // seconds
                if(this.time[2] >= 59) {
                    this.time[2] = 0
                } else {
                    this.time[2] = this.time[2] + 1
                }
            }
        }
    }

    format_time(time) {
        return `${time[0] < 10 ? '0' : ''}${time[0]}:${time[1] < 10 ? '0' : ''}${time[1]}:${time[2] < 10 ? '0' : ''}${time[2]}`
    }

    time_mins() {
        return (this.time[0] * 60) + this.time[1]
    }

    translate_point_to_text(type, plane_x, plane_y) {
            for(let i = 0; i < type.length; i++) {
                if(type[i][0] == plane_x && type[i][1] == plane_y) {
                    if(type == grid.stands) return i +1
                    if(type == grid.holding_points) return this.holding_point_names[i]
                }
            }
    }

    is_a_neighbour(x , y, current_p) {
        let last_vector = planes[current_p].path_to_destination[planes[current_p].path_to_destination.length - 1] || undefined
        if(last_vector != undefined) {
            if(last_vector[0] + 1 == x || last_vector[1] + 1 == y || last_vector[0] - 1 == x || last_vector[1] - 1 == y) {
                return true
            } else {
                return false
            }
        }
    }

    point_is_valid(x, y, plane) {
        // check stands
        for(let j = 0; j < this.spawn_areas.length; j++) {
            if((plane.current_x == x && plane.current_y == y)) {
                return true
            }
        }

        //check taxiway
        for(let i = 0; i < this.moveable_areas.length; i++) {
            if(this.moveable_areas[i][0] == x && this.moveable_areas[i][1] == y) return true
        }

        // check hold
        for(let j = 0; j < this.holding_points.length; j++) {
            if(this.holding_points[j][0] == x && this.holding_points[j][1] == y) return true
        }

        // check runway
        for(let j = 0; j < this.runway.length; j++) {
            if(this.runway[j][0] == x && this.runway[j][1] == y) return false
        }
        // if all not true, then return false and allow movement
        return false
    }

    buttons_text() {
        fill('black')
        textSize(20)
        text(`${this.airport}`, 0.2 * this.grid_size, (this.total_grid_size + 0.5) * this.grid_size)
        text(`Score: ${score.total_score}\nTime: ${this.format_time(this.time)}`, (this.total_grid_size + 1.5) * this.grid_size, 1 * this.grid_size)

        for(let i = 0; i < planes.length; i++) {
            text(`${planes[i].callsign}: ${planes[i].current_status}`, (this.total_grid_size + 1.5) * this.grid_size, (3.5 + (i/2)) * this.grid_size)
        }

        this.play_pause_button.position((this.total_grid_size + 1.5) * this.grid_size, 1.7 * this.grid_size)
        this.speed_one_button.position((this.total_grid_size + 1.5) * this.grid_size, 2.2 * this.grid_size)
        this.speed_two_button.position((this.total_grid_size + 2) * this.grid_size, 2.2 * this.grid_size)
        this.speed_five_button.position((this.total_grid_size + 2.5) * this.grid_size, 2.2 * this.grid_size)
        this.speed_ten_button.position((this.total_grid_size + 3) * this.grid_size, 2.2 * this.grid_size)

        // if the play/pause is pressed, then
        this.play_pause_button.mousePressed(() => {
            // swap the value
            this.gameplay_play == true ? this.gameplay_play = false : this.gameplay_play = true
        })
        // if the x1 speed button pressed, then
        this.speed_one_button.mousePressed(() => {
            // modify the value of variable
            this.gameplay_speed = 30
        })
        // if the x2 speed button pressed, then
        this.speed_two_button.mousePressed(() => {
            // modify the value of variable
            this.gameplay_speed = 10
        })
        // if the x5 speed button pressed, then
        this.speed_five_button.mousePressed(() => {
            // modify the value of variable
            this.gameplay_speed = 2
        })
        // if the x10 speed button pressed, then
        this.speed_ten_button.mousePressed(() => {
            // modify the value of variable
            this.gameplay_speed = 0.5
        })
    }
}