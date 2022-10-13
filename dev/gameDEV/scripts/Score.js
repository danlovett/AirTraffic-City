class Score {
    constructor() {
        this.runway_score = 30
        this.correct_delivery_score = 20
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
        return `Score: ${this.total_score}`;
    }

    update_score(type, plane) {
        // this function takes in a string arg which is declared in the scipt.js file,
        // ... then updates the score using that declared arg
        // positive results
        if(type == "correct_runway") {
            this.total_score = this.total_score + this.runway_score;
            plane.score = plane.score + this.runway_score;
            console.log('taken to correct runway')
        }
        if(type == "delivery_on_time") {
            this.total_score = this.total_score + this.correct_delivery_score;
            plane.score = plane.score + this.correct_delivery_score;
            console.log('CTOT correlates with <this.time>')
        }
        if(type == "correct_hp") {
            this.total_score = this.total_score + this.hp_score;
            plane.score = plane.score + this.hp_score;
            console.log('taken to correct hp')
        }
        
        // negative results
        if(type == "wrong_runway") {
            this.total_score = this.total_score - this.runway_score;
            plane.score = plane.score - this.runway_score;
            console.log('taken to the wrong runway')
        }
        if(type == "delivery_off_time") {
            this.total_score = this.total_score - this.correct_delivery_score;
            plane.score = plane.score - this.correct_delivery_score;
            console.log('CTOT does NOT correlate with <this.time>')
        }
        if(type == 'wrong_hp') {
            this.total_score = this.total_score - this.hp_score;
            plane.score = plane.score - this.hp_score;
            console.log('taken to the wrong hp')
        }
    }
}