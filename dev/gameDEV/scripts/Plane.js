class Plane {
    constructor(spawn_point) {
        this.spawn_point = spawn_point

        this.callsign = undefined;
        this.type = undefined;
        this.fpln_type = undefined;
        this.wake_cat = undefined;
        this.destination = undefined;
        this.hp_destination = grid.holding_points[floor(random(grid.holding_points.length))]

        this.current_x = this.spawn_point[0];
        this.current_y = this.spawn_point[1];
        this.enable_moving = false;
        this.path_to_destination = [];
        this.current_status;
        this.time_off_stand = [];
        this.score = 0;

        this.handover = false
        this.permit_path = true

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

        let prefix = grid.callsign_prefixses[floor(random(grid.callsign_prefixses.length))]
        let numbers = `${floor(random(9))}${floor(random(9))}`
        let index = floor(random(grid.ac_types.length))
        this.callsign = `${prefix}${numbers}`
        this.type = grid.ac_types[index][0]
        this.wake_cat = grid.ac_types[index][1]
        this.destination = grid.destinations[floor(random(grid.destinations.length))]
    }

    show_plane_info() {
        fill('black')
        textSize(15)
        text(this.callsign, this.current_x * grid.grid_size + (grid.grid_size-50), this.current_y * grid.grid_size + (grid.grid_size-45))
        textSize(10)
        text(`${this.type} ${this.wake_cat}`, this.current_x * grid.grid_size + (grid.grid_size-50), this.current_y * grid.grid_size + (grid.grid_size - 30))
        text(this.destination, this.current_x * grid.grid_size + (grid.grid_size/3.5), this.current_y * grid.grid_size + (grid.grid_size - 5))
        text(this.hp_destination, this.current_x * grid.grid_size + (grid.grid_size/3.5), this.current_y * grid.grid_size + (grid.grid_size - 15))
        fill('white')
    }

    spawn() {
        fill(color(this.color))
        stroke('black')
        rect(this.current_x * grid.grid_size, this.current_y * grid.grid_size, grid.grid_size, grid.grid_size)
        noStroke()
    }

    update_status() {
        if(this.current_x == this.spawn_point[0] && this.current_y == this.spawn_point[1]) this.current_status = 'at-stand'

        if(this.path_to_destination.length > 0) this.current_status = 'taxying'

        for(let i = 0; i < grid.holding_points.length; i++) {
            if(this.current_x == grid.holding_points[i][0] && this.current_y == grid.holding_points[i][1]) this.current_status = 'hold'
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
            if([this.current_x, this.current_y] != this.spawn_point) {
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
        if(this.hp_destination[0] == this.current_x && this.hp_destination[1] == this.current_y) {
            this.color = color(20, 200, 20)
            score.update_score(String("correct_runway"), this)

        } else {
            this.color = color(200, 20, 20)
        }
    }
}