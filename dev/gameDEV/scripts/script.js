// declaring to make globally avail
let grid_x, grid_y
let grid_size = 60
let continue_travel_points = false
let spawn = true
let planes = []

let permit_path = false
let pathing_plane = undefined


function setup() {
    createCanvas(windowWidth, windowHeight)

    grid = new Grid(10, 10, grid_size)
    for(let i = 0; i <= 4; i++) {
        for(let row = 0; row < grid.total_grid_size; row++) {
            for(let col = 0; col < grid.total_grid_size; col++) {
                if(grid.grid[row][col] == "1") grid.spawn_areas.push([row, col])
                if(grid.grid[row][col] == "2") grid.moveable_areas.push([row, col])
                if(grid.grid[row][col] == "3") grid.holding_points.push([row, col])
                if(grid.grid[row][col] == "4") grid.runway.push([row, col])
            }
        }

        let spawn_point = grid.spawn_areas[floor(random(grid.spawn_areas.length))]
        
        planes.push(new Plane(spawn_point, 'A320'))
        planes[i].makeCallsign()
        grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
    }


    // remove context menu to allow right clicks in browser
	for (let element of document.getElementsByClassName("p5Canvas")) {
    	element.addEventListener("contextmenu", (e) => e.preventDefault());
  	}

    frameRate(30)
}

function draw() {
    // clear()
    background('green')

    // GRID
    grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.total_grid_size - 1)
    grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.total_grid_size - 1)

    grid.render()
    grid.show_areas()
    
    //PLANES
    for(let i = 0; i < planes.length; i++) {
        planes[i].spawn()
        planes[i].update_position()


        grid.render_selector_tool(grid_x, grid_y)
        planes[i].showCallsign()
        if(planes[i].path_to_destination.length != 0 && permit_path == true) {
            let path = planes[pathing_plane].path_to_destination[planes[i].path_to_destination.length - 1]
            if([grid_x, grid_y] != path && grid.is_a_neighbour(grid_x, grid_y, pathing_plane) && grid.point_is_valid(grid_x, grid_y)) {
                planes[pathing_plane].update_travel_points([grid_x, grid_y])
            } 

            if(!grid.point_is_valid(grid_x,grid_y)) {
                permit_path = false
            }
        }
    }
}

function mousePressed() {
    for(let i = 0; i < planes.length; i++) {
        if(mouseButton == LEFT) {
            if(grid_x == planes[i].current_x && grid_y == planes[i].current_y && !permit_path) {
                planes[i].update_travel_points([grid_x, grid_y])
                permit_path = true;
                pathing_plane = i;
            }
        } else if (mouseButton == RIGHT) {
            planes[i].enable_moving = true
            permit_path = false
            // console.log(planes[pathing_plane].enable_moving, permit_path)
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}