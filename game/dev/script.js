function setup() {
    createCanvas(windowWidth, windowHeight)

    grid = new Grid(12, 12)
}

function draw() {
    background('green')
    grid_x = constrain(floor((mouseX/grid.grid_size)), 0, grid.total_grid_size )
    grid_y = constrain(floor((mouseY/grid.grid_size)), 0, grid.total_grid_size )

    grid.render()
    grid.render_selector_tool(grid_x, grid_y)
    grid.makeButtons()
    grid.buttonPress()
    // grid.makeButtons()
}

function mousePressed() {
    grid.update(grid_x, grid_y)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}