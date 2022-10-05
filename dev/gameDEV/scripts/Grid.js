class Grid {
    constructor(cols, rows, size_of_cell) {
        this.cols = cols;
        this.rows = rows;
        this.grid_size = size_of_cell;
        this.moveable_areas = [[0,1], [2,1], [4,1], [6,1], [8,1], [10,1], [0,3], [2,3], [4,3], [6,3], [8,3], [10,3], [6,1],[0,2], [0,2], [0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [10,2], [10, 3], [10,4], [10,5], [10,6]]
        this.spawn_areas = [[0,0], [2,0], [4,0], [6,0], [8,0], [10,0], [0,4], [2,4], [4,4], [6,4], [8,4]]
        this.callsign_prefixses = ['EZY', 'BAW', 'RYR', 'JBE', 'EZE', 'EJU', 'PJS', 'PRIV']
        this.ac_types = ['A320', 'B738', 'B777', 'E145s']
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
        for(let i = 0; i < planes.length; i++) {
            if([planes[i].current_x, planes[i].current_y] != planes[i].spawn_point) {
                this.spawn_areas.push(planes[i].spawn_point)
            }
        }
        fill('grey')
        for(let vector = 0; vector < this.moveable_areas.length; vector++) {
            rect(this.moveable_areas[vector][0] * this.grid_size, this.moveable_areas[vector][1] * this.grid_size, this.grid_size, this.grid_size)
        }
        fill('blue')
        for(let vector = 0; vector < this.spawn_areas.length; vector++) {
            rect(this.spawn_areas[vector][0] * this.grid_size, this.spawn_areas[vector][1] * this.grid_size, this.grid_size, this.grid_size)
        }
    }

    is_a_neighbour(x , y, current_p) {
        let last_vector = planes[current_p].path_to_destination[planes[current_p].path_to_destination.length - 1]
        if(last_vector[0] + 1 == x || last_vector[1] + 1 == y || last_vector[0] - 1 == x || last_vector[1] - 1 == y) {
            return true
        } else {
            return false
        }
    }
}