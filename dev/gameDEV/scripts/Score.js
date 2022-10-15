class Score {
    constructor() {
        this.runway_score = 30
        this.ctot_score = 20
        this.hp_score = 10
        // to be added detecting instances when two aricraft are 1x1 or less grid space differece
        // ... excludes when at holding point
        this.near_miss = 10

        this.total_score = 0;
    
        // future code
        this.correct_arrival_stand = 40
    }

    show_score() {
        textSize(20)
        fill('black')
        text(`Score: ${this.total_score}`, 10.5 * grid.grid_size, 1 * grid.grid_size)
    }

    update_score(type, plane) {
        // this function takes in a string arg which is declared in the scipt.js file,
        // ... then updates the score using that declared arg
        // positive results
        if(type == "correct_runway") {
            console.log(`RUNWAY - ${plane.callsign}\nadd ${this.runway_score} to total (${this.total_score})\nadd ${this.runway_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score + this.runway_score;
            plane.score = plane.score + this.runway_score;
        }
        if(type == "correct_ctot") {
            console.log(`CTOT - ${plane.callsign}\nadd ${this.ctot_score} to total (${this.total_score})\nadd ${this.ctot_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score + this.ctot_score;
            plane.score = plane.score + this.ctot_score;
        }
        if(type == "correct_hp") {
            console.log(`HP - ${plane.callsign}\nadd ${this.hp_score} to total (${this.total_score})\nadd ${this.hp_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score + this.hp_score;
            plane.score = plane.score + this.hp_score;
        }
        
        // negative results
        if(type == "wrong_runway") {
            console.log(`RUNWAY - ${plane.callsign}\nremove ${this.runway_score} to total (${this.total_score})\nremove ${this.runway_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score - this.runway_score;
            plane.score = plane.score - this.runway_score;
        }
        if(type == "wrong_ctot") {
            console.log(`CTOT - ${plane.callsign}\nremove ${this.ctot_score} to total (${this.total_score})\nremove ${this.ctot_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score - this.ctot_score;
            plane.score = plane.score - this.ctot_score;
        }
        if(type == 'wrong_hp') {
            console.log(`HP - ${plane.callsign}\nremove ${this.hp_score} to total (${this.total_score})\nremove ${this.hp_score} to PLANE total (${plane.score})`)
            this.total_score = this.total_score - this.hp_score;
            plane.score = plane.score - this.hp_score;
        }
    }
}