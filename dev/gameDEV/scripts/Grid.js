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
        
        this.gameplay_play = true
        
        // game start time
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

        this.play_pause_button = createButton(`play/pause`).style('background-color', 'white')
        this.speed_buttons = [createButton(`x1`), createButton(`x2`), createButton(`x5`), createButton(`x10`)]
        this.gameplay_speeds = [30, 10, 2, 0.5]

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
        let last_vector = control_planes[current_p].path_to_destination[control_planes[current_p].path_to_destination.length - 1] || undefined
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

        // !!update this later to show two aircraft crash if true!!
        for(let i = 0; i < control_planes.length; i++) {
            text(`${control_planes[i].callsign}: ${control_planes[i].current_status}`, (this.total_grid_size + 1.5) * this.grid_size, (3.5 + (i/2)) * this.grid_size)
        }

        this.play_pause_button.position((this.total_grid_size + 1.5) * this.grid_size, 1.7 * this.grid_size)

        let button_pos_y = 1.5
        for(let i = 0; i < this.speed_buttons.length; i++) {
            this.speed_buttons[i].position((this.total_grid_size + button_pos_y) * this.grid_size, 2.2 * this.grid_size)
            button_pos_y = button_pos_y + 0.7
        }
        
        // if the play/pause is pressed, then
        this.play_pause_button.mousePressed(() => {
            if(this.gameplay_play == true) {
                this.gameplay_play = false
                this.play_pause_button.style('background-color', 'black')
                this.play_pause_button.style('color', 'white')
            }  else {
                this.gameplay_play = true
                this.play_pause_button.style('background-color', 'white')
                this.play_pause_button.style('color', 'black')
            }
        })

        for(let i = 0; i < this.speed_buttons.length; i++) {
            this.speed_buttons[i].mousePressed(() => {
                this.gameplay_speed = this.gameplay_speeds[i]
            })
        }
        for(let index = 0; index < this.speed_buttons.length; index++) {
            if(this.gameplay_speeds[index] == this.gameplay_speed) {
                this.speed_buttons[index].style('background-color', 'white')
                this.speed_buttons[index].style('color', 'black')
            } else {
                this.speed_buttons[index].style('background-color', 'black')
                this.speed_buttons[index].style('color', 'white')
            }
        }
    }
}