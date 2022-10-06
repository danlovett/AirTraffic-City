class Plane {
    constructor(spawn_point) {
        this.spawn_point = spawn_point

        this.callsign = undefined;
        this.type = undefined
        this.current_x = this.spawn_point[0];
        this.current_y = this.spawn_point[1];
        this.enable_moving = false
        this.path_to_destination = [];
        this.current_status = 'at-stand';

        this.speed = (type) => {
                switch (type) {
                    case 'A320':
                        return 30
                    case 'B738':
                        return 30
                    case 'B777':
                        return 45
                    case 'E145s':
                        return 50
                    default:
                        return 35
                }
        }

        this.color = 'yellow'
    }

    makeCallsign() {
        let prefix = grid.callsign_prefixses[floor(random(grid.callsign_prefixses.length))]
        let numbers = `${floor(random(9))}${floor(random(9))}`
        this.callsign = `${prefix}${numbers}`
        this.type = grid.ac_types[floor(random(grid.ac_types.length))]

    }

    showCallsign() {
        fill('black')
        textSize(15)
        text(this.callsign, this.current_x * grid_size + (grid_size/6), this.current_y * grid_size + (grid_size/2))
        textSize(10)
        text(this.type, this.current_x * grid_size + (grid_size/3.5), this.current_y * grid_size + (grid_size/1.4))
        fill('white')
    }

    spawn() {
        fill(this.color)
        rect(this.current_x * grid_size, this.current_y * grid_size, grid_size, grid_size)
    }

    update_position() {
        if(frameCount % this.speed(this.type) == 0) {
            if(this.path_to_destination.length != 0 && this.enable_moving == true) {
                textSize(20)
                text(this.callsign, this.path_to_destination[this.path_to_destination.length - 1][0] * this.grid_size, this.path_to_destination[this.path_to_destination.length - 1][1] * this.grid_size)
                this.current_x = this.path_to_destination[0][0]
                this.current_y = this.path_to_destination[0][1]
                this.path_to_destination.splice(this.path_to_destination[0], 1)
            } else {
                this.enable_moving = false
            }
            return true
        } else {
            return false
        }
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
}