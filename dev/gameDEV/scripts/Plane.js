class Plane {
    constructor(spawn_point, type) {
        this.spawn_point = spawn_point
        this.type = type;

        this.callsign = undefined;
        this.current_x = undefined;
        this.current_y = undefined;
        this.points_to_destination = [];
        this.current_status = 'at-stand';
    }

    makeCallsign() {
        let prefix = grid.callsign_prefixses[floor(random(grid.callsign_prefixses.length))]
        let numbers = `${floor(random(9))}${floor(random(9))}`
        this.callsign = `${prefix}${numbers}`
    }

    showCallsign() {
        fill('black')
        textSize(15)
        text(this.callsign, this.current_x * grid_size + (grid_size/5), this.current_y * grid_size + (grid_size/2))
        fill('white')
    }

    spawn() {
        fill('yellow')
        rect(this.spawn_point[0] * grid_size, this.spawn_point[1] * grid_size, grid_size, grid_size)
        this.current_x = this.spawn_point[0];
        this.current_y = this.spawn_point[1];
        
        return [this.current_x, this.current_y]
        
    }

    update_position(status) {
        switch (status) {
            case 'push':
                console.log(status)
            case 'taxi':
                console.log(status)
            case 'holding-point':
                console.log(status)
            case 'handover':
                console.log(status)
        }
        // show the update using FIFO
        rect(this.points_to_destination[0][0] * grid_size, this.points_to_destination[0][1] * grid_size, grid_size, grid_size)
        // remove used position from points list
        this.points_to_destination.splice(this.points_to_destination[0], 1)
        //sucessful operation
        return true
    }

    update_travel_points(point) {
        if(point != this.points_to_destination[this.points_to_destination.length - 1]) {
            this.points_to_destination.push(point)
            return true
        } else {
            return false
        }
    }


}