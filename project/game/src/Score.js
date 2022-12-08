class Score {
    constructor() {
        this.runway_score = 30;
        this.ctot_score = 50;
        this.hp_score = 20;
        this.near_miss = 2;
        this.aircraft_deleted = 0;

        this.ctot_delete = 40

        this.total_score = 0;
    
        // future code
        this.correct_arrival_stand = 40
    }

    update_score(type, plane) {
        // this function takes in a string arg which is declared in the scipt.js file,
        // ... then updates the score using that declared arg
        // positive results
        if(type == "correct_runway") {
            this.total_score = this.total_score + this.runway_score;
            plane.score = plane.score + this.runway_score;
        }
        if(type == "correct_ctot") {
            this.total_score = this.total_score + this.ctot_score;
            plane.score = plane.score + this.ctot_score;
        }
        if(type == "correct_hp") {
            this.total_score = this.total_score + this.hp_score;
            plane.score = plane.score + this.hp_score;
        }
        
        // negative results
        if(type == "wrong_runway") {
            this.total_score = this.total_score - (this.runway_score / 2);
            plane.score = plane.score + (this.runway_score / 2);
        }
        if(type == "wrong_ctot") {
            this.total_score = this.total_score - (this.ctot_score / 2);
            plane.score = plane.score + (this.ctot_score / 2);
        }
        if(type == 'wrong_hp') {
            this.total_score = this.total_score - (this.hp_score / 2);
            plane.score = plane.score + (this.hp_score / 2);
        }

        if(type == 'near_miss') {
            this.total_score = this.total_score + this.near_miss;
            plane.score = plane.score + (this.near_miss / 2);
        }

        if(type == 'remove_ac_ctot') {
            this.total_score = this.total_score - this.ctot_delete;
            plane.score = plane.score + (this.ctot_delete / 4);
            this.aircraft_deleted++
        }

        if(this.aircraft_deleted == 5) grid.endgame('max_aircraft_deleted')
    }
}