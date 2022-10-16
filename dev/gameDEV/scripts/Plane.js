class Plane {
    constructor(spawn_point) {
        this.spawn_point = spawn_point
        this.current_status;
        this.hp_destination_name;

        this.callsign = undefined;
        this.type = undefined;
        this.fpln_type = undefined;
        this.wake_cat = undefined;
        this.destination = undefined;
        
        this.enable_moving = false;
        this.handover = false
        this.permit_path = true
        
        this.score = 0;
        this.ctot_to_mins = 0;
        
        this.current_x = this.spawn_point[0];
        this.current_y = this.spawn_point[1];
        this.hp_destination = [];
        this.path_to_destination = [];
        this.time_off_stand = [];
        this.ctot = [];


        this.speed = (type) => {
                switch (type) {
                    case 'A320':
                        return 60 * grid.gameplay_speed
                    case 'B738':
                        return 60 * grid.gameplay_speed
                    case 'B777':
                        return 80 * grid.gameplay_speed
                    case 'E145s':
                        return 30 * grid.gameplay_speed
                    default:
                        return 40 * grid.gameplay_speed
                }
        }

        this.color = color(random(100, 255), random(50, 255), random(50, 255))
    }

    add_plane_info(type) {
        if(type == 'dep') this.fpln_type = 'out'
        if(type == 'arr') this.fpln_type = 'in'

        let prefix_array = [];
        for(let j = 0; j < grid.callsign_prefixses.length; j++) {
            for(let i = 1; i < grid.callsign_prefixses[j].length; i++) {
                if(grid.callsign_prefixses[j][i] == grid.airport) prefix_array.push(grid.callsign_prefixses[j][0])
            }
        }

        let prefix = prefix_array[floor(random(prefix_array.length))]
        let numbers = `${floor(random(9))}${floor(random(9))}`
        let index = floor(random(grid.ac_types.length))
        let random_hp_destination = floor(random(grid.holding_points.length))
        this.callsign = `${prefix}${numbers}`
        this.type = grid.ac_types[index][0]
        this.wake_cat = grid.ac_types[index][1]
        this.destination = grid.destinations[floor(random(grid.destinations.length))]
        this.hp_destination = grid.holding_points[random_hp_destination]
        this.hp_destination_name = grid.holding_point_names[random_hp_destination]

    }

    show_plane_info() {
        fill('black')
        textSize(13)
        text(this.callsign, this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size-45))
        textSize(10)
        text(`${this.type} ${this.wake_cat}`, this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size - 30))
        text(`${grid.format_time(this.ctot)}`, this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size - 18))
        text(this.destination, this.current_x * grid.grid_size + (grid.grid_size - 33), this.current_y * grid.grid_size + (grid.grid_size - 5))
        text(this.hp_destination_name, this.current_x * grid.grid_size + (grid.grid_size - 55), this.current_y * grid.grid_size + (grid.grid_size - 5))
        fill('white')
    }

    make_ctot(add_mins, type, operation) {
        let made_time = []
        let add_hours
        let temp = (add_mins/60)
        let time_to_mins 
        operation == 'get_ctot_variance' ? time_to_mins = (this.ctot[0] * 60) + this.ctot[1] : time_to_mins = (grid.time[0] * 60) + grid.time[1]
        grid.time_to_mins = time_to_mins
        
        if(temp.toString().split('.')[1] >= '5') {
            add_hours = ceil(temp)
        } else {
            add_hours = floor(temp)
        }
        
        made_time[0] = floor(time_to_mins/60) + add_hours

        if(made_time[0] >= 24) {
            made_time[0] = 0 + (made_time[0] % 24)
        } 
        
        made_time[1] = floor((time_to_mins + add_mins) % 60)
        made_time[2] = 0

        // checking for negative when calc ctot lower in score class
        if(Math.sign(made_time[0]) === -1) {
            made_time[0] = 24 + made_time[0]
        }
        if(Math.sign(made_time[1]) === -1) {
            made_time[1] = 60 + made_time[1]
        }

        this.ctot_to_mins =  (made_time[0] * 60) + made_time[1]

        if(type == 'mins') {
            return this.ctot_to_mins
        } else {
            return made_time
        }

    }

    spawn() {
        fill(color(this.color))
        stroke('black')
        rect(this.current_x * grid.grid_size, this.current_y * grid.grid_size, grid.grid_size, grid.grid_size)
        noStroke()
    }

    update_status() {
        if(this.current_x == this.spawn_point[0] && this.current_y == this.spawn_point[1]) this.current_status = `stand ${grid.translate_point_to_text(grid.stands, this.current_x, this.current_y)}`

        if(this.path_to_destination.length > 0) this.current_status = `taxi to ${this.path_to_destination[this.path_to_destination.length - 1]}`

        for(let i = 0; i < grid.holding_points.length; i++) {
            if(this.current_x == grid.holding_points[i][0] && this.current_y == grid.holding_points[i][1]) this.current_status = `holding at ${grid.holding_points[i][2]}`
        }

        for(let i = 0; i < grid.runway.length; i ++) {
            if(this.current_x == grid.runway[i][0] && this.current_y == grid.runway[i][1]) this.current_status = 'taking-off'
        }
    }

    update_position() {
        if(frameCount % this.speed(this.type) == 0) {
            if(this.path_to_destination.length != 0 && this.enable_moving == true) {
                textSize(20)
                this.show_plane_info()
                this.current_x = this.path_to_destination[0][0]
                this.current_y = this.path_to_destination[0][1]
                this.path_to_destination.splice(this.path_to_destination[0], 1)
            } else {
                this.enable_moving = false
            }
            // getting time off stand, detecting when it left spawn area
            if(this.current_x != this.spawn_point[0] && this.current_y != this.spawn_point[1]) {
                this.time_off_stand = grid.time
                grid.spawn_areas.push(this.spawn_point)
            }
            return true
        } else {
            return false
        }
    }

    show_callsign_path_destination() {
        noFill()
        rect(this.path_to_destination[this.path_to_destination.length - 1][0] * grid.grid.grid_size, this.path_to_destination[this.path_to_destination.length - 1][1] * grid.grid.grid_size, grid.grid.grid_size, grid.grid.grid_size)
    }

    update_travel_points(point) {
        if(point != this.path_to_destination[this.path_to_destination.length - 1]) {
            this.path_to_destination.push(point)
            return true
        } else {
            return false
        }
    }

    intersects(other) {
		if(this.current_x == other.current_x && this.current_y == other.current_y) {
			return true
		} else {
			return false
		}
	}
    
    handover_plane() {
        this.handover = true
        let lower_ctot = this.make_ctot(-5, 'mins', 'get_ctot_variance')
        let upper_ctot = this.make_ctot(10, 'mins', 'get_ctot_variance')

        console.log(this.make_ctot(-5, 'mins', 'get_ctot_variance'))

        if(this.hp_destination[0] == this.current_x && this.hp_destination[1] == this.current_y) {
            this.color = color(20, 200, 20)
            score.update_score("correct_hp", this)
        } else {
            this.color = color(200, 20, 20)
            score.update_score("wrong_hp", this)
        }

        if(lower_ctot < grid.time_mins()
            && upper_ctot > grid.time_mins()) {
            score.update_score('correct_ctot', this)
        } else {
            score.update_score('wrong_ctot', this)
        }
    }
}