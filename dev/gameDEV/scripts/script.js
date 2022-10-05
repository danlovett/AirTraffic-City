// declaring to make globally avail
let grid_x, grid_y
let grid_size = 80
let continue_travel_points = false
let spawn = true
let planes = []


function setup() {
    createCanvas(windowWidth, windowHeight)
    grid = new Grid(10, 10, grid_size)
    for(let i = 0; i <= 4; i++) {
        let spawn_point = grid.spawn_areas[floor(random(grid.spawn_areas.length))]
        
        planes.push(new Plane(spawn_point, 'A320'))
        planes[i].makeCallsign()
        
        grid.spawn_areas.splice(grid.spawn_areas.indexOf(spawn_point), 1)
    }
}

function draw() {
    // clear()
    background('grey')

    // GRID
    grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.cols)
    grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.rows)

    grid.render()
    grid.show_areas('move')
    grid.show_areas('spawn')
    
    //PLANES
    for(let i = 0; i < planes.length; i++) {
        planes[i].spawn()
        grid.render_selector_tool(grid_x, grid_y)
        planes[i].showCallsign()
        // console.log(i, planes[i].current_x, planes[i].current_y)
    }
}

function mouseClicked() {
    console.log('click', grid_x, grid_y)
}

function mouseDragged() {
    if((grid_x == plane.current_x && grid_y == plane.current_y) || continue_travel_points == true) {
        plane.update_travel_points([grid_x, grid_y])
        continue_travel_points = true
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}