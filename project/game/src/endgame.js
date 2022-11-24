
let details = window.location.href.split('?')[1] // get all details after the ?
let time_taken = CryptoJS.AES.decrypt(details.split('&')[0], "time").toString(CryptoJS.enc.Utf8); // first value
let total_score = CryptoJS.AES.decrypt(details.split('&')[1], "score").toString(CryptoJS.enc.Utf8); // second value
let level_played = CryptoJS.AES.decrypt(details.split('&')[2], "level").toString(CryptoJS.enc.Utf8); // third value
// let best_plane = details.split('&')[3] // fourth value

$.get('../../app.json', json => { // get the data from this file location, use json as variable
    // getting the image through cycling all level names in the json file
    for(let i = 0; i < json.library.levels.titles.length; i++) {
        if(json.library.levels.titles[i] == level_played) {
            // set the background to correlated condition
            $('#endgame').css('background-image', `url(../../private/images/levels/${level_played}.jpg)`)
        }
    }
})

// setting text for each differernt id in the endgame.html file
$('#level').text(`Game ended at ${level_played}`)
$('#timetaken').text(`${Math.floor(time_taken/60)} minute${time_taken/60 >= 1 ? 's' : ''}`)
$('#score').text(`${total_score} point${total_score == 1 ? '' : 's'}`)
// $('#bestaircraft').text(`Best performing aircraft: ${best_plane}`)

$('#eog').click(() => {
    window.location.href = `${window.location.origin}/usr_history_submit?score=${total_score}&level=${level_played}`
})

$('#eog-small').click(() => {
    window.location.href = `${window.location.origin}/usr_leaderboard_submit?score=${total_score}&level=${level_played}`
})
