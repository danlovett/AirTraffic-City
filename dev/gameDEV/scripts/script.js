// declaring to make globally avail
let grid_x, grid_y
let control_planes = []
let other_control = []
let can_spawn_now = true


function setup() {
    createCanvas(windowWidth, windowHeight)

    score = new Score()

    grid = new Grid(10, 10)

    grid.init()

    for(let i = 0; i <= floor(random(5, 9)); i++) {
        let spawn_point = grid.spawn_areas[floor(random(grid.spawn_areas.length))]
        grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
        
        control_planes.push(new Plane(spawn_point))
        control_planes[i].add_plane_info('dep')
        control_planes[i].ctot = control_planes[i].make_ctot(floor(random(20, 80)))
    }

    for(let i = 0; i < grid.holding_points.length; i++) {
        grid.holding_points[i].push(`${char(i + 65)}1`)
    }


    // spawn_proto()

    // remove context menu to allow right clicks in browser
	for (let element of document.getElementsByClassName("p5Canvas")) {
    	element.addEventListener("contextmenu", (e) => e.preventDefault());
  	}
}

function draw() {
    // clear()
    background(grid.color_grass)

    if(grid.gameplay_allowed) {
        // GRID
        grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.total_grid_size - 1)
        grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.total_grid_size - 1)
    
        grid.render()
        grid.show_areas()
        grid.time_now()
        grid.buttons_text()
    
        
        //control_planes MOVEMENT
        control_my_planes(control_planes)
        control_other_planes()
    
    
        score.show_score()
    
        // placed at end of block code to make result appear on top
        grid.render_selector_tool(grid_x, grid_y)
    } else {
        grid.finish_game()
    }

}

function keyPressed() {
    if(grid.gameplay_play == true) {
        for(let i = 0; i < control_planes.length; i++) {
            control_planes[i].permit_path = false
            for(let j = 0; j < grid.holding_points.length; j++) {
                if(control_planes[i].handover == false) {
                    if(control_planes[i].current_x == grid.holding_points[j][0]
                        && control_planes[i].current_y == grid.holding_points[j][1]
                        && grid_x == grid.holding_points[j][0]
                        && grid_y == grid.holding_points[j][1]
                        && key == 'h'
                        && control_planes[i].handover == false) {
                        const button_handover = createButton('handover').style('background-color', 'yellow')
                        button_handover.position(mouseX, mouseY)
                        button_handover.mousePressed(() => {
                            control_planes[i].handover_plane()
                            button_handover.hide()
                        })

                    } 
                }
            }
        }
        if(key == '1') grid.gameplay_speed = 30
        if(key == '2') grid.gameplay_speed = 10
        if(key == '3') grid.gameplay_speed = 2
        if(key == '4') grid.gameplay_speed = 0.5
    }
}

function mousePressed() {
    if(grid.gameplay_play == true) {
        for(let i = 0; i < control_planes.length; i++) {
            if(mouseButton == LEFT) {
                if (grid_x == control_planes[i].current_x && grid_y == control_planes[i].current_y && control_planes[i].enable_moving == false) {
                    control_planes[i].update_travel_points([grid_x, grid_y])
                    control_planes[i].permit_path = true
                }
            }
            
            if (mouseButton == RIGHT ) {
                if(control_planes[i].permit_path == true) {
                    control_planes[i].permit_path = false
                    control_planes[i].enable_moving = true

                }
            }
        }
    }
}

// allow window resize and show more of canvas that may be hidden
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function spawn_proto() {
    let new_plane_index = control_planes.length 
    if(grid.spawn_areas.length > 1) {
        for(let i = 0; i < grid.spawn_areas.length / 3; i++) {
            let spawn_point = grid.spawn_areas[0]
            grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
            
            control_planes.push(new Plane(spawn_point))
            control_planes[new_plane_index].add_plane_info('dep')
            control_planes[new_plane_index].make_ctot(floor(random(20, 120)), 'make_ctot')
            new_plane_index++
        }
    }
    can_spawn_now = false
}

function control_my_planes(control_planes) {
    for(let i = 0; i < control_planes.length; i++) {
        control_planes[i].spawn()
        control_planes[i].show_plane_info()
        if(grid.gameplay_play == true) { // all gameplay actions
            for(let j = 0; j < control_planes.length; j++) {
                if(control_planes[i].intersects(control_planes[j]) && j!=i) grid.gameplay_allowed = false
                if(control_planes[i].near_miss(control_planes[j]) && j!=i) score.update_score('near_miss', control_planes[i])
            }
            
            control_planes[i].update_position()
            control_planes[i].update_status()
            control_planes[i].live_info_check()
            
            if(control_planes[i].path_to_destination != [] && control_planes[i].permit_path == true) {
                let path = control_planes[i].path_to_destination[control_planes[i].path_to_destination.length - 1]
                if([grid_x, grid_y] != path && grid.is_a_neighbour(grid_x, grid_y, i) && grid.point_is_valid(grid_x, grid_y, control_planes[i])) control_planes[i].update_travel_points([grid_x, grid_y])
                if(grid.point_is_valid(grid_x,grid_y, control_planes[i]) == false) {
                    control_planes[i].permit_path = false
                    control_planes[i].enable_moving = true
                } 
            }
            
            if(control_planes[i].path_to_destination.length != 0 && control_planes[i].permit_path == false && control_planes[i].handover == false) {
                control_planes[i].show_grid_destination_info()
            }
            for(let j = 0; j < grid.holding_points.length; j++) {
                if(control_planes[i].current_x == grid.holding_points[j][0] && control_planes[i].current_y == grid.holding_points[j][1]){
                    control_planes[i].permit_path = false
                }
            }
        }
        
    }
}

function control_other_planes() {
    for (let i = 0; i < other_control.length; i++) {
        other_control[i].spawn()
        other_control[i].show_plane_info()
        other_control[i].update_position()
    }
}