let details = window.location.href.split('?')[1]
let time_taken = details.split('&')[0]
let total_score = details.split('&')[1]
let level_played = details.split('&')[2]
let best_plane = details.split('&')[3]

$.get('../lib/raw/app.json', function(json) {
    for(let i = 0; i < json.library.levels.titles.length; i++) {
        if(json.library.levels.titles[i] == level_played) {
            $('#endgame').css('background-image', `url(../lib/src/levels/${level_played}.jpg)`)
            $('.image').css('background-image', `url(../lib/src/levels/${level_played}.jpg)`)
        }
    }
})
$('#level').text(`Game ended at ${level_played}`)
$('#timetaken').text(`Time taken to complete: ${time_taken}`)
$('#score').text(`You gained ${total_score} point${total_score == 1 ? '' : 's'}`)
$('#bestaircraft').text(`Best performing aircraft: ${best_plane}`)