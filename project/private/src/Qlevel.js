const url_search = window.location.href.split('?')[1]
const level = CryptoJS.AES.decrypt(url_search.split('&')[0], "level").toString(CryptoJS.enc.Utf8)
let type = CryptoJS.AES.decrypt(url_search.split('&')[1], "status-message").toString(CryptoJS.enc.Utf8)

console.log(level)

if(type == "0") $('#level-desc').text('This is your best played level.')
if(type == "1") $('#level-desc').text('This is your last played level.')
if(type == "2") $('#level-desc').remove()

$('#level-name').text(level)
$('#level-detail').css('background-image', `url(../private/images/levels/${level}.jpg)`)
$('#level-detail').css('background-size', 'cover')
$('<a>',{
    text: `Play at ${level}`,
    class: 'level-play',
    href: `/game?${level}`,
}).appendTo('#level-detail');

$(document).prop('title', `Play @ ${level} | ATC`)