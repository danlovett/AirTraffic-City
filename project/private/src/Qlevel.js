const url_search = new URLSearchParams(window.location.search)
const level = url_search.get('id')
let type = url_search.get('type')

if(type != null) {
    if(type == "0") $('#level-desc').text('This is your best played level.')
    if(type == "1") $('#level-desc').text('This is your last played level.')
} else {
    $('#level-desc').remove()
}


$('#level-name').text(level)
$('#level-detail').css('background-image', `url(../private/images/levels/${level}.jpg)`)
$('#level-detail').css('background-size', 'cover')
$('<a>',{
    text: `Play at ${level}`,
    class: 'level-play',
    href: `/game?${level}`,
}).appendTo('#level-detail');

$(document).prop('title', `Play @ ${level} | ATC`)