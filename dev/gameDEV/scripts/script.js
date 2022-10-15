// declaring to make globally avail
let grid_x, grid_y
let planes = []


function setup() {
    createCanvas(windowWidth, windowHeight)

    score = new Score()

    grid = new Grid(10, 10)

    for(let col = 0; col < grid.total_grid_size; col++) {
        for(let row = 0; row < grid.total_grid_size; row++) {
            if(grid.grid[row][col] == "0") grid.grass_areas.push([row, col])
            if(grid.grid[row][col] == "1") grid.spawn_areas.push([row, col])
            if(grid.grid[row][col] == "1") grid.stands.push([row, col])
            if(grid.grid[row][col] == "2") grid.moveable_areas.push([row, col])
            if(grid.grid[row][col] == "3") grid.holding_points.push([row, col])
            if(grid.grid[row][col] == "4") grid.runway.push([row, col])
            if(grid.grid[row][col] == "5") grid.runway_entry.push([row, col])
        }
    }

    for(let i = 0; i < grid.holding_points.length; i++) {
        grid.holding_point_names.push(`${char(i + 65)}1`)
    }


    for(let i = 0; i <= floor(random(5, 9)); i++) {
        let spawn_point = grid.spawn_areas[floor(random(grid.spawn_areas.length))]
        grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
        
        planes.push(new Plane(spawn_point))
        planes[i].add_plane_info('dep')
        planes[i].ctot = planes[i].make_ctot(floor(random(20, 120)))
    }

    grid.create_gameplay_buttons()

    // remove context menu to allow right clicks in browser
	for (let element of document.getElementsByClassName("p5Canvas")) {
    	element.addEventListener("contextmenu", (e) => e.preventDefault());
  	}
}

function draw() {
    // clear()
    background(grid.color_grass)

    // GRID
    grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.total_grid_size - 1)
    grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.total_grid_size - 1)

    grid.render()
    grid.show_areas()
    grid.time_now()
    grid.show_gameplay_buttons()
    
    //PLANES MOVEMENT
    process_plane_movement()

    score.show_score()

    // placed at end of block code to make result appear on top
    grid.render_selector_tool(grid_x, grid_y)
}

function keyPressed() {
    if(grid.gameplay_play == true) {
        for(let i = 0; i < planes.length; i++) {
            planes[i].permit_path = false
            for(let j = 0; j < grid.holding_points.length; j++) {
                if(planes[i].handover == false) {
                    if(planes[i].current_x == grid.holding_points[j][0]
                        && planes[i].current_y == grid.holding_points[j][1]
                        && grid_x == grid.holding_points[j][0]
                        && grid_y == grid.holding_points[j][1]
                        && key == 'h'
                        && planes[i].handover == false) {
                        const button_handover = createButton('handover')
                        button_handover.position(mouseX, mouseY)
                        button_handover.mousePressed(() => {
                            planes[i].handover_plane()
                            button_handover.hide()
                        })

                    } 
                }
            }
        }
    }
}

function mousePressed() {
    if(grid.gameplay_play == true) {
        for(let i = 0; i < planes.length; i++) {
            if(mouseButton == LEFT) {
                if (grid_x == planes[i].current_x && grid_y == planes[i].current_y && planes[i].enable_moving == false) {
                    planes[i].update_travel_points([grid_x, grid_y])
                    planes[i].permit_path = true
                }
            }
            
            if (mouseButton == RIGHT ) {
                planes[i].enable_moving = true
                planes[i].permit_path = false
            }
        }
    }
}

// allow window resize and show more of canvas that may be hidden
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function process_plane_movement() {
    for(let i = 0; i < planes.length; i++) {
        planes[i].spawn()
        planes[i].show_plane_info()
        if(grid.gameplay_play == true) { // all gameplay actions
            for(let j = 0; j < planes.length; j++) {
                if(planes[i].intersects(planes[j]) && j!=i) grid.gameplay_play = false
            }
            
            planes[i].update_position()
            planes[i].update_status()
            
            if(planes[i].path_to_destination.length != 0 && planes[i].permit_path == true) {
                let path = planes[i].path_to_destination[planes[i].path_to_destination.length - 1]
                if([grid_x, grid_y] != path && grid.is_a_neighbour(grid_x, grid_y, i) && grid.point_is_valid(grid_x, grid_y, planes[i])) planes[i].update_travel_points([grid_x, grid_y])
                if(grid.point_is_valid(grid_x,grid_y, planes[i]) == false) {
                    planes[i].permit_path = false
                    planes[i].enable_moving = true
                } 
            }
            
            if(planes[i].path_to_destination.length != 0 && planes[i].permit_path == false && planes[i].handover == false) {
                fill(planes[i].color)
                rect(planes[i].path_to_destination[planes[i].path_to_destination.length - 1][0] * grid.grid_size, planes[i].path_to_destination[planes[i].path_to_destination.length - 1][1] * grid.grid_size, grid.grid_size, grid.grid_size)
                fill('black')
                text(planes[i].callsign, planes[i].path_to_destination[planes[i].path_to_destination.length - 1][0] * grid.grid_size + (grid.grid_size-55), planes[i].path_to_destination[planes[i].path_to_destination.length - 1][1] * grid.grid_size + (grid.grid_size-45))
                text(planes[i].type, planes[i].path_to_destination[planes[i].path_to_destination.length - 1][0] * grid.grid_size + (grid.grid_size-55), planes[i].path_to_destination[planes[i].path_to_destination.length - 1][1] * grid.grid_size + (grid.grid_size-5))
            }
            for(let j = 0; j < grid.holding_points.length; j++) {
                if(planes[i].current_x == grid.holding_points[j][0] && planes[i].current_y == grid.holding_points[j][1]){
                    planes[i].permit_path = false
                }
            }
        }
        
    }
}