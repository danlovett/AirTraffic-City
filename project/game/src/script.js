// declaring to make globally avail
let grid_x, grid_y
let control_planes = []
let other_control = []
let all_planes = []
let can_spawn_now = true
let grid

function preload() {
    logo = loadImage('/private/images/logo.png');
    logo.resize(50, 50)
    tile_3 = loadImage('/game/src/tiles/3.png')
    tile_5 = loadImage('/game/src/tiles/5.png')
    tile_6 = loadImage('/game/src/tiles/6.png')
    tile_7 = loadImage('/game/src/tiles/7.png')
    tile_8 = loadImage('/game/src/tiles/8.png')
    tile_9 = loadImage('/game/src/tiles/9.png')
    tile_10 = loadImage('/game/src/tiles/10.png')
    tile_11 = loadImage('/game/src/tiles/11.png')
    tile_12 = loadImage('/game/src/tiles/12.png')
    tile_13 = loadImage('/game/src/tiles/13.png')
    tile_14 = loadImage('/game/src/tiles/14.png')
    tile_cline_h = loadImage('/game/src/tiles/2.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    
    score = new Score()

    grid = new Grid()
    
    // initiate the grid using these values from the ejs file.
    grid.init($('#level_name').text(), $('#icao').text(), JSON.parse($('#level_runways').text()), 
    JSON.parse($('#level_grid').text()), JSON.parse($('#planes').text()), $('#destinations').text())

    for(let i = 0; i <= floor(random(4, 9)); i++) {
        let spawn_point = grid.spawn_areas[floor(random(grid.spawn_areas.length))]
        grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
        
        control_planes.push(new Plane(spawn_point))
        control_planes[i].add_plane_info('dep')
        control_planes[i].ctot = control_planes[i].make_ctot(floor(random(20, 80)))

        all_planes.push(control_planes[i])
    }
    
    for(let i = 0; i < grid.holding_points.length; i++) {
        grid.holding_points[i].push(`${char(i + 65)}1`)
    }
    spawn_proto()

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
        // integer values of the mouseX/Y positions, divide by total grid size, and constrain to the length of grid from 0
        grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.total_grid_size - 1)
        grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.total_grid_size - 1)
        
        // add the layers for each differernt section.
        grid.handle_taxiway_render()
        grid.handle_runway_render()
        grid.show_areas()
        // update the in-time game
        grid.time_now()
        // show time, score, buttons to control speed and play/pause, 
        // ... and any aicraft in their AoC
        grid.buttons_text()
        
        
        control_my_planes(control_planes) // control my planes
        // control_other_planes()
        for(let i = 0; i < control_planes.length; i++) {
            control_planes[i].show_travel_points()
        }
    
        // placed at end of block code to make result appear on top
        grid.render_selector_tool(grid_x, grid_y)
    } else { // if grid.gameplay_allowed is false
        // redirect user to this page with set values
        window.location.href = `${window.location.origin}/play-ended?level=${$('#level_name').text()}&time=${grid.ellapsed_time_seconds}&score=${score.total_score}&reason=${grid.message}`
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
                        const button_handover = createButton(`Handover to ${grid.airport} Tower`).style('background-color', 'yellow')
                        button_handover.position(mouseX, mouseY)
                        button_handover.mousePressed(() => {
                            control_planes[i].handover_plane()
                            button_handover.hide()
                        })

                    } 
                }
            }
            // DEV
            if(control_planes[i].current_x == grid_x
                && control_planes[i].current_y == grid_y
                && key == 'r') {
                const button_handover = createButton('remove').style('background-color', 'grey')
                button_handover.position(mouseX, mouseY)
                button_handover.mousePressed(() => {
                    control_planes[i].remove_plane()
                    button_handover.hide()
                })

            } 
        }
        if(key == '1') grid.gameplay_speed = 30
        if(key == '2') grid.gameplay_speed = 10
        if(key == '3') grid.gameplay_speed = 2
        if(key == '4') grid.gameplay_speed = 0.5
    }
    if(key === "Escape") {
        let leave = confirm("Are you sure you want to exit the game?\nYou'll lose your progress.")
        if(leave) window.location.href = 'http://localhost:4000/library'
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
                if(control_planes[i].show_points == true) {
                    for(let point = 0; point < control_planes[i].path_to_destination.length; point++) {
                        if(grid_x == control_planes[i].path_to_destination[point][0] && grid_y == control_planes[i].path_to_destination[point][1]) {
                            control_planes[i].path_to_destination.splice(control_planes[i].path_to_destination.indexOf(control_planes[i].path_to_destination[point]) + 1, control_planes[i].path_to_destination.length)
                            control_planes[i].show_points = false
                        }
                    }
                }
                if (grid_x == control_planes[i].current_x && grid_y == control_planes[i].current_y && control_planes[i].enable_moving == true) {
                    control_planes[i].show_points = true
                }
                grid.handle_taxiway_render(grid_x, grid_y)
            }
            
            if (mouseButton == RIGHT ) {
                if(control_planes[i].permit_path == true) {
                    control_planes[i].permit_path = false
                    control_planes[i].enable_moving = true
                }
                if (grid_x == control_planes[i].current_x && grid_y == control_planes[i].current_y && control_planes[i].show_points == true) {
                    control_planes[i].show_points = false
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
        for(let i = 0; i < floor(random(grid.spawn_areas.length)); i++) {
            let spawn_point = grid.spawn_areas[0]
            grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
            
            control_planes.push(new Plane(spawn_point))
            control_planes[new_plane_index].add_plane_info('dep')
            control_planes[new_plane_index].ctot = control_planes[new_plane_index].make_ctot(floor(random(20, 120)))
            all_planes.push(control_planes[new_plane_index])
            new_plane_index++
        }
    }
    can_spawn_now = false
}

function control_my_planes(control_planes) {
    for(let i = 0; i < control_planes.length; i++) {
        control_planes[i].show_history()
        control_planes[i].spawn()
        if(grid.gameplay_play == true) { // all gameplay actions
            for(let j = 0; j < control_planes.length; j++) {
                if(control_planes[i].intersects(control_planes[j]) && j!=i) grid.endgame('collision')
                if(control_planes[i].near_miss(control_planes[j]) && j!=i) score.update_score('near_miss', control_planes[i])
            }
            
            control_planes[i].update_position()
            control_planes[i].update_status()
            control_planes[i].live_info_check()
            
            if(control_planes[i].path_to_destination.length != 0 && control_planes[i].permit_path == true) {
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

// function control_other_planes() {
// //     for (let i = 0; i < other_control.length; i++) {
// //         other_control[i].spawn()
// //         other_control[i].update_position()
// //     }
// // }