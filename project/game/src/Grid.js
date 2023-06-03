class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid_size = 60;
        
        //declare grid
        this.grid = [];
        this.totals = [
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ]
        this.total_grid_size;
        // declare grid sides
        this.grid_side_left = 1
        this.grid_side_right = 4
        this.grid_side_top = 2
        this.grid_side_bottom = 7
        // declare areas
        this.grass_areas = [];
        this.moveable_areas = [];
        this.spawn_areas = [];
        this.stands = [];
        this.holding_points = [];
        this.runway = [];
        this.runway_entry = [];
        this.control_tower = [];
        // declare specifics
        this.runway_numbers = [];
        this.destinations;
        this.airport;
        this.icao;
        
        this.gameplay_allowed = true
        this.gameplay_play = true
        
        // game start time
        this.time = [10, 15, 30]
        this.time_to_mins = 0;
        this.gameplay_speed = 30 // lower val = faster, higher val = slower default = 30
        this.finish_time;
        this.finish_time_to_mins;
        this.ellapsed_time_seconds = "0";

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

    init(airport, icao, runways, grid, planes, destinations) {
        this.airport = airport
        this.grid = grid;
        this.plane_data = planes;
        this.destinations = destinations;
        this.icao = icao;
        this.total_grid_size = grid.length;

        this.runway_numbers = runways;

        for(let col = 0; col < this.total_grid_size; col++) {
            for(let row = 0; row < this.total_grid_size; row++) {
                if(this.grid[row][col] == "0") this.grass_areas.push([row, col])
                if(this.grid[row][col] == "1") this.spawn_areas.push([row, col])
                if(this.grid[row][col] == "1") this.stands.push([row, col])
                if(this.grid[row][col] == "2") this.moveable_areas.push([row, col])
                if(this.grid[row][col] == "3") this.holding_points.push([row, col])
                if(this.grid[row][col] == "4") this.runway.push([row, col])
                if(this.grid[row][col] == "5") this.runway_entry.push([row, col])
                if(this.grid[row][col] == "7") this.control_tower =[row, col]
            }
        }

        this.runway.sort((a,b) => {
            if (a[0] === b[0]) {
                return 0;
            } else {
                return (a[0] < b[0]) ? -1 : 1;
            }
        }) 

        this.finish_time = [this.time[0] + 2, this.time[1], 0]
    }

    // dev
    handle_taxiway_render() {
        for(let grid_x = 0; grid_x < this.total_grid_size; grid_x++) {
            for(let grid_y = 0; grid_y < this.total_grid_size; grid_y++) {
                let totals = 0
                try {
                    if((this.grid[grid_x - 1][grid_y] == "2" && this.grid[grid_x][grid_y] == "2") || (this.grid[grid_x - 1][grid_y] == "3" && this.grid[grid_x][grid_y] == "2")) totals = totals + this.grid_side_left
                    if((this.grid[grid_x + 1][grid_y] == "2" && this.grid[grid_x][grid_y] == "2") || (this.grid[grid_x + 1][grid_y] == "3" && this.grid[grid_x][grid_y] == "2")) totals = totals + this.grid_side_right
                    if((this.grid[grid_x][grid_y - 1] == "2" && this.grid[grid_x][grid_y] == "2") || (this.grid[grid_x][grid_y - 1] == "3" && this.grid[grid_x][grid_y] == "2")) totals = totals + this.grid_side_top
                    if((this.grid[grid_x][grid_y + 1] == "2" && this.grid[grid_x][grid_y] == "2") || (this.grid[grid_x][grid_y + 1] == "3" && this.grid[grid_x][grid_y] == "2")) totals = totals + this.grid_side_bottom
                }catch{}
                this.totals[grid_x][grid_y] = totals
            }
        }
    }

    handle_runway_render() {
        for(let grid_x = 0; grid_x <= this.total_grid_size; grid_x++) {
            for(let grid_y = 0; grid_y <= this.total_grid_size; grid_y++) {
                let totals = 0
                try {
                    //c-line v and h
                    if((this.grid[grid_x - 1][grid_y] == '4' && this.grid[grid_x][grid_y] == '4') || (this.grid[grid_x + 1][grid_y] == '4' && this.grid[grid_x][grid_y] == '4')) this.totals[grid_x][grid_y] = 2
                    if((this.grid[grid_x][grid_y - 1] == '4' && this.grid[grid_x][grid_y] == '4') || (this.grid[grid_x][grid_y + 1] == '4' && this.grid[grid_x][grid_y] == '4')) this.totals[grid_x][grid_y] = 1
                    
                    //endpoints
                    if(this.grid[grid_x][grid_y] == '5') console.log('cline to right at ', grid_x, grid_y)
                    if((this.grid[grid_x][grid_y] == '5' && this.grid[grid_x - 1][grid_y] == '4')) console.log('cline to left at ', grid_x, grid_y)
                    if((this.grid[grid_x][grid_y] == '5' && this.grid[grid_x][grid_y + 1] == '4')) console.log('cline to top at ', grid_x, grid_y)
                    if((this.grid[grid_x][grid_y] == '5' && this.grid[grid_x][grid_y - 1] == '4')) console.log('cline to bottom at ', grid_x, grid_y)
                }catch{}
            }
        }
    }

    render_selector_tool(grid_x, grid_y) {
        stroke('yellow')
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
                if(this.totals[row][col] == 3) {
                    // console.log(`TILE: ${tile_3}\nX: ${grid_x * this.total_grid_size}\nY: ${grid_y * this.total_grid_size}\n----------------------`)
                    image(tile_3, row * this.grid_size, col * this.grid_size) 
                    tile_3.resize(60,60)
                } 
                if(this.totals[row][col] == 5) {
                    image(tile_5, row * this.grid_size, col * this.grid_size)
                    tile_5.resize(60,60)
                }
                if(this.totals[row][col] == 6) {
                    image(tile_6, row * this.grid_size, col * this.grid_size)
                    tile_6.resize(60,60)
                }
                if(this.totals[row][col] == 7) {
                    image(tile_7, row * this.grid_size, col * this.grid_size)
                    tile_7.resize(60,60)
                }
                if(this.totals[row][col] == 8) {
                    image(tile_8, row * this.grid_size, col * this.grid_size)
                    tile_8.resize(60,60)
                }
                if(this.totals[row][col] == 9) {
                    image(tile_9, row * this.grid_size, col * this.grid_size)
                    tile_9.resize(60,60)
                }
                if(this.totals[row][col] == 10) {
                    image(tile_10, row * this.grid_size, col * this.grid_size)
                    tile_10.resize(60,60)
                }
                if(this.totals[row][col] == 11) {
                    image(tile_11, row * this.grid_size, col * this.grid_size)
                    tile_11.resize(60,60)
                }
                if(this.totals[row][col] == 12) {
                    image(tile_12, row * this.grid_size, col * this.grid_size)
                    tile_12.resize(60,60)
                }
                if(this.totals[row][col] == 13) {
                    image(tile_13, row * this.grid_size, col * this.grid_size)
                    tile_13.resize(60,60)
                }
                if(this.totals[row][col] == 14) {
                    image(tile_14, row * this.grid_size, col * this.grid_size)
                    tile_14.resize(60,60)
                }

                if(this.totals[row][col] == 2) {
                    image(tile_cline_h, row * this.grid_size, col * this.grid_size)
                    tile_cline_h.resize(60,60)
                }
            }
        }
        // stands
        for(let i = 0; i < this.stands.length; i++) {
            text(`Stand\n   ${i + 1}`, this.stands[i][0] * this.grid_size + (this.grid_size-43), this.stands[i][1] * this.grid_size + (this.grid_size-35))
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
                this.ellapsed_time_seconds++
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
                this.time_to_mins = (this.time[0] * 60) + this.time[1]
                this.finish_time_to_mins = (this.finish_time[0] * 60) + this.finish_time[1]
            }
        }

        if(this.time[1] % 40 == 0 && this.time[2] % 60 == 0 && can_spawn_now) spawn_proto()
        if(this.time[1] == 30) can_spawn_now = true
        if(this.time_to_mins == this.finish_time_to_mins) grid.endgame('level_finished')
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

    find_nearest_runway(plane_x, plane_y) {
        for(let i = 0; i < this.runway.length; i++) {
            if(((plane_x + 1 == this.runway[i][0] && plane_y == this.runway[i][1]) || 
            (plane_x - 1 == this.runway[i][0] && plane_y == this.runway[i][1]) ||
            (plane_x == this.runway[i][0] && plane_y + 1 == this.runway[i][1]) ||
            (plane_x == this.runway[i][0] && plane_y - 1 == this.runway[i][1]) )) {
                return this.runway[i]
            }
        }
    }

    buttons_text() {
        // background ui
        fill(color(50, 50, 50))
        rect(0, (this.total_grid_size + 0.5) * this.grid_size, windowWidth, windowHeight)

        // airport info name and icao with border
        fill(color(100,100,100))
        rect(0.2 * this.grid_size, (this.total_grid_size + 0.7) * this.grid_size, 1.7 * this.grid_size, 1.95 * this.grid_size)
        fill('white')
        textSize(20)
        image(logo, 0.2 * this.grid_size, (this.total_grid_size + 0.5) * this.grid_size)
        logo.resize(100, 100)
        text(this.airport, 0.5 * this.grid_size, (this.total_grid_size + 2.1) * this.grid_size)
        text(this.icao, 0.4 * this.grid_size, (this.total_grid_size + 2.5) * this.grid_size)
        textStyle(BOLD)
        text(this.format_time(this.time), 2 * this.grid_size, (this.total_grid_size + 1) * this.grid_size)
        text(`${score.total_score} points`, 2.5 * this.grid_size, (this.total_grid_size + 2.2) * this.grid_size)
        textSize(17)

        let airplane_status_x_position = 5
        let airplane_status_y_position = 0
        for(let i = 0; i < control_planes.length; i++) {
            if(i % 4 === 0 && i != 0 ) {
                airplane_status_x_position = airplane_status_x_position + 3
                airplane_status_y_position = 0
            } 
            text(`${control_planes[i].callsign}: ${control_planes[i].current_status}`, airplane_status_x_position * this.grid_size, (this.total_grid_size + 1 + (airplane_status_y_position/2)) * this.grid_size)
            airplane_status_y_position ++
        }

        this.play_pause_button.position(3.5 * this.grid_size, (this.total_grid_size + 0.7) * this.grid_size)

        let button_pos_y = 2
        for(let i = 0; i < this.speed_buttons.length; i++) {
            this.speed_buttons[i].position(button_pos_y * this.grid_size, (this.total_grid_size + 1.2) * this.grid_size)
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

    endgame(reason) {
        this.gameplay_allowed = false
        this.message = reason
    }
}