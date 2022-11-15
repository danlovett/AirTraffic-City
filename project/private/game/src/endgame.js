
let details = window.location.href.split('?')[1] // get all details after the ?
let time_taken = details.split('&')[0] // first value
let total_score = details.split('&')[1] // second value
let level_played = details.split('&')[2] // third value
// let best_plane = details.split('&')[3] // fourth value

console.log(time_taken/60)

$.get('./app.json', json => { // get the data from this file location, use json as variable
    // getting the image through cycling all level names in the json file
    for(let i = 0; i < json.library.levels.titles.length; i++) {
        if(json.library.levels.titles[i] == level_played) {
            // set the background to correlated condition
            $('#endgame').css('background-image', `url(../lib/src/levels/${level_played}.jpg)`)
        }
    }
})

function convert_time(time) {
}

// setting text for each differernt id in the endgame.html file
$('#level').text(`Game ended at ${level_played}`)
$('#timetaken').text(`You took ${time_taken/60} minute${time_taken/60 != 1 ? 's' : ''}`)
$('#score').text(`You gained ${total_score} point${total_score == 1 ? '' : 's'}`)
// $('#bestaircraft').text(`Best performing aircraft: ${best_plane}`)

