class Plane {
    constructor(spawn_point) {
        this.callsign = undefined;
        this.type = undefined;
        this.wake_cat = undefined;
        this.destination = undefined;
        this.fpln_type = undefined;
        
        this.spawn_point = spawn_point
        
        this.current_x = this.spawn_point[0];
        this.current_y = this.spawn_point[1];
        this.current_status;
        this.cs_raw;
        this.show_points = false;

        this.time_off_stand = [];
        this.ctot = [];
        this.ctot_to_mins = 0;
        
        this.enable_moving = false;
        this.handover = false
        this.permit_path = true
        
        this.score = 0;
        
        
        this.hp_destination = [];
        this.path_to_destination = [];
        this.path_history = [];


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

        this.ac_text = 'black'
        this.color = color(random(100, 250), random(100, 250), random(80, 200))
        this.action_color = [color(135,206,250), color(255,127,80), color(128,0,32), color('red')]
        this.good_hp_color = color('green')
        this.bad_hp_color = color('red')
    }

    add_plane_info(type) {
        // when spawn happening, declare if the aircraft is outbound or inbound, and assign it to fpln_type variable
        if(type == 'dep') this.fpln_type = 'out'
        if(type == 'arr') this.fpln_type = 'in'
        
        let index = floor(random(grid.plane_data.length))
        let prefix = grid.plane_data[index]["callsign_prefix"] // get a random callsign from possible callsign array
        let numbers = `${floor(random(9))}${floor(random(9))}` // randomly generate numbers for callsign
        let letters = (Math.random() + 1).toString(36).substring(5).toUpperCase().slice(0,2);
        this.callsign = `${prefix}${numbers}${letters}` // finalise callsign and assign it

        this.type = grid.plane_data[index]["airframe"]
        this.wake_cat = grid.plane_data[index]["wake_category"]
        // get a random destination for aicraft to fly to from destinations array in grid class
        // this.destination = grid.destinations[floor(random(grid.destinations.length))]
        
        // for now, random_hp_destination gets a random hp for aircraft to taxi to
        let random_hp_destination = floor(random(grid.holding_points.length)) // update later to get set hp for dep runway
        this.hp_destination = grid.holding_points[random_hp_destination] // get vector for hp_dest

    }

    spawn() {
        fill(color(this.color)) // get randomly made colour for `this`
        stroke('black')
        rect(this.current_x * grid.grid_size, this.current_y * grid.grid_size, grid.grid_size, grid.grid_size) // show the aircraft using grid size and positioning
        noStroke() // reset default stroke
        fill(this.ac_text)
        textSize(11)
        text(this.callsign, this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size-45)) // callsign text to user
        textSize(10)
        text(`${this.type} ${this.wake_cat}`, this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size - 30)) // type text to user
        text(grid.format_time(this.ctot), this.current_x * grid.grid_size + (grid.grid_size-55), this.current_y * grid.grid_size + (grid.grid_size - 18)) // ctot time text to user
        text(this.destination, this.current_x * grid.grid_size + (grid.grid_size - 33), this.current_y * grid.grid_size + (grid.grid_size - 5)) // destination text to user
        text(this.hp_destination[2], this.current_x * grid.grid_size + (grid.grid_size - 55), this.current_y * grid.grid_size + (grid.grid_size - 5)) // where they are taxying to
        fill('white')
    }
    // update the current position of aircraft if the speed allows
    update_position() {
        // only update if the speed value == frame number
        if(frameCount % this.speed(this.type) == 0) {
            // if this aircraft can move, then move it using the first posititon in path_to_destination
            if(this.path_to_destination.length != 0 && this.enable_moving == true) {
                textSize(20)
                this.spawn()
                this.current_x = this.path_to_destination[0][0] // update x pos
                this.current_y = this.path_to_destination[0][1] // update y pos
                this.path_history.unshift(this.path_to_destination[0]) // add this array in path history array
                this.path_to_destination.splice(this.path_to_destination[0], 1) // remove this array in path array
                if(this.path_history.length > 4) this.path_history.pop()
            } else {
                this.enable_moving = false // set to false if path is finished
                this.permit_path = true
                this.removeHistoryIteratively()
            }
            // getting time off stand, detecting when it left spawn area
            if(this.current_x != this.spawn_point[0] && this.current_y != this.spawn_point[1]) {
                this.time_off_stand = grid.time
                grid.spawn_areas.push(this.spawn_point) // allow posititon to be spawnable again
            }
            return true
        } else {
            return false
        }
    }

    // hp destination display to user
    show_grid_destination_info() { // show text and colour of plane at the path destination point (text: aircraft callsign and type)
        fill(this.color)
        rect(this.path_to_destination[this.path_to_destination.length - 1][0] * grid.grid_size, this.path_to_destination[this.path_to_destination.length - 1][1] * grid.grid_size, grid.grid_size, grid.grid_size)
        fill('black')
        text(this.callsign, this.path_to_destination[this.path_to_destination.length - 1][0] * grid.grid_size + (grid.grid_size-55), this.path_to_destination[this.path_to_destination.length - 1][1] * grid.grid_size + (grid.grid_size-45))
        text(this.type, this.path_to_destination[this.path_to_destination.length - 1][0] * grid.grid_size + (grid.grid_size-55), this.path_to_destination[this.path_to_destination.length - 1][1] * grid.grid_size + (grid.grid_size-5))
    }

    // add a different point from path_to_destination[path_to_destination.length - 1] to the array
    update_travel_points(point) {
        if(point != this.path_to_destination[this.path_to_destination.length - 1]) { // is the point trying to be added not the same as point already pushed to array?
            this.path_to_destination.push(point) // add point
            return true
        } else {
            return false // don't add point and return false
        }
    }

    show_travel_points() {
        if(this.show_points == true) {
            fill(this.color)
            for(let i = 0; i < this.path_to_destination.length; i++) {
                rect(this.path_to_destination[i][0] * grid.grid_size + 10, this.path_to_destination[i][1] * grid.grid_size + 10, grid.grid_size - 20, grid.grid_size - 20)
                
            }
            noFill()
        }
    }

    // raw and extended is updated here.
    // what is the aircraft currently doing?
    update_status() {
        // if aircraft in a stand location, show the stand number in the aircraft information section of game
        if(this.current_x == this.spawn_point[0] && this.current_y == this.spawn_point[1]) {
            this.current_status = `stand ${grid.translate_point_to_text(grid.stands, this.current_x, this.current_y)}`
            this.cs_raw = 'stand'
            
        }
        
        if(this.path_to_destination.length > 0) { // if aircraft's path has a value, show which vector its moving to and display to aircraft_infromation section of game
            this.current_status = `taxying`
            this.cs_raw = 'taxi'
        } 
        if(this.path_to_destination.length == 0 && this.current_x != this.spawn_point[0] && this.current_y != this.spawn_point[1]) {
            this.current_status = `holding position at ${this.current_x}, ${this.current_y}`
            this.cs_raw = 'stopped'
        }

        // seeing if aircraft at a holding point position
        for(let i = 0; i < grid.holding_points.length; i++) { // search through all indexs of the holding_points array
            // if index of holding_points matches aircraft's position, then show this to the user in the aicraft information section
            if(this.current_x == grid.holding_points[i][0] && this.current_y == grid.holding_points[i][1]) {
                this.current_status = `holding at ${grid.holding_points[i][2]}`
                this.cs_raw = 'hold'
            } 
        }

        if(this.handover == true) {
            this.current_status = 'handed over'
            this.cs_raw = 'handover'
        } 

        // is the aircraft taking off (checking posititions if aircraft matches a runway section on grid)
        for(let i = 0; i < grid.runway.length; i ++) {
            if(this.current_x == grid.runway[i][0] && this.current_y == grid.runway[i][1]) this.current_status = 'taking-off'
        }

        for(let i = 0; i < control_planes.length; i++) {
            for(let j = 0; j < control_planes.length; j++) {
                if(control_planes[i].current_x == control_planes[j].current_x && control_planes[i].current_y == control_planes[j].current_y && i!=j) control_planes[i].current_status = `Crashed with ${control_planes[j].callsign}` 
            }
        }
    }

    removeHistoryIteratively() {
        if(frameCount % this.speed(this.type) == 0) {
            this.path_history.pop()
        }
    }

    show_history() {
        let width_percent = 10
        this.color.setAlpha(200)
        fill(this.color)
        for(let i = 0; i < this.path_history.length; i++) {
            rect(this.path_history[i][0] * grid.grid_size + width_percent, this.path_history[i][1] * grid.grid_size + width_percent, grid.grid_size - (width_percent*2), grid.grid_size - (width_percent*2))
            width_percent = width_percent + 5
        }
        this.color.setAlpha(1000)
        noFill()
    }

    // create/get temporary value of/modify ctot
    make_ctot(add_mins, type, operation) {
        // declare local variables
        let made_time = []
        // add_hours delcared here to allow manipulation to it
        let add_hours
        // temporarily make variable for the hours returned (getting float as well so floor() and ceil() not used here)
        let temp = (add_mins/60)
        let time_to_mins 
        // set up which operation to complete
        // ?CTOT variance for score calculation
        // ?make the CTOT itself
        operation == 'get_ctot_variance' ? time_to_mins = (this.ctot[0] * 60) + this.ctot[1] : time_to_mins = (grid.time[0] * 60) + grid.time[1]
        
        if(temp.toString().split('.')[1] >= '5') { // if the excact value is .5, ceil() it
            add_hours = ceil(temp)
        } else { // otherwise floor() it
            add_hours = floor(temp)
        }
        
        // set the hour value from time_to_mins variable
        made_time[0] = floor(time_to_mins/60) + add_hours

        // time reset it if reaches past midnight 
        if(made_time[0] >= 24) {
            made_time[0] = 0 + (made_time[0] % 24) // get remainder off 24
        } 
        
        made_time[1] = floor((time_to_mins + add_mins) % 60) // add mins from current time and get the remainder of it using MOD 60
        made_time[2] = 0

        // checking for negative when calc ctot lower in score class
        if(Math.sign(made_time[0]) === -1) { // negative value?
            made_time[0] = 24 + made_time[0] // using sign logic, add the parsed arg to 24 to, in turn, remove it from 24
        }
        if(Math.sign(made_time[1]) === -1) { // native value?
            made_time[1] = 60 + made_time[1] // using sign logic, add the parsed arg to 24 to, in turn, remove it from 24
        }

        if(type == 'mins') {
            return this.ctot_to_mins // want the ctot in mins? return it then
        } else {
            this.ctot_to_mins =  (made_time[0] * 60) + made_time[1] // convert time into mins and assign it to this ctot_to_mins
            return made_time
        }

    }

    // update plane color and text 
    // CTOT usage
    live_info_check() {
        if(this.ctot_to_mins - 10 <= grid.time_to_mins) {
            this.color = this.action_color[0]
            this.ac_text = 'black'
        }
        
        if(this.ctot_to_mins - 5 <= grid.time_to_mins) {
            this.color = this.action_color[1]
            this.ac_text = 'black'
        }
        
        if(this.ctot_to_mins + 10 <= grid.time_to_mins) {
            this.color = this.action_color[2]
            this.ac_text = 'white'
        }

        if(this.ctot_to_mins + 20 <= grid.time_to_mins) {
            if(frameCount % 40 === 0) {
                if(this.ac_text == 'white') {
                    this.color = this.action_color[3]
                    this.ac_text == 'black'
                }
                
                if (this.ac_text == 'black') {
                    this.color = this.action_color[2]
                    this.ac_text = 'white'
                }
            }
        }

        if(this.ctot_to_mins + 30 <= grid.time_to_mins) {
            control_planes.splice(control_planes.indexOf(this), 1)
            score.update_score('remove_ac_ctot', this)
        }
    }

    // is there a crash?
    intersects(other) {
        // does the posititon of two different aircraft match?
		if(this.current_x == other.current_x && this.current_y == other.current_y) {
			return true // if yes, return true
		} else {
			return false // otherwise return false
		}
	}
    // true/false - detect if two aircraft are near each other (+-1 from current pos)
    near_miss(other) {
        if(frameCount % this.speed(this.type) === 0) {
            if(((this.current_x + 1 == other.current_x && this.current_y == other.current_y) || 
                (this.current_x - 1 == other.current_x && this.current_y == other.current_y) ||
                (this.current_x == other.current_x && this.current_y + 1 == other.current_y) ||
                (this.current_x == other.current_x && this.current_y - 1 == other.current_y) )
             &&(this.cs_raw != 'stand' && other.cs_raw != 'stand')) {
                return true
             } else {
                return false
             }
        }
    }

    // handover process when plane reaches the holding point
    handover_plane() { // make aircraft unmoveable, change colour, and update score
        this.handover = true

        control_planes.splice(control_planes.indexOf(this), 1) // remove plane from user control
        // other_control.push(this) // add it to a different array which will act as AI access and movements

        // scoring uses external functions that are called
        // if the aircraft posititon is the holding point destination, then add points
        if(this.hp_destination[0] == this.current_x && this.hp_destination[1] == this.current_y) {
            this.color = this.good_hp_color
            score.update_score("correct_hp", this)
        } else { // otherwise remove points
            this.color = this.bad_hp_color
            score.update_score("wrong_hp", this)
        }

        // check lower and upper ctot variables, and check this with the current time in mins
        if(this.ctot_to_mins - 5 <= grid.time_to_mins
            && this.ctot_to_mins + 10 >= grid.time_to_mins) {
            score.update_score('correct_ctot', this) // add points if correct
        } else {
            score.update_score('wrong_ctot', this) // remove points if wrong
        }
    }

    remove_plane() {
        control_planes.splice(control_planes.indexOf(this), 1)
    }

    ai_movement() {
        if(frameCount % this.speed(this.type) == 0) {
            other_control.pop()
        }
    }
}