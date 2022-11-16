let urlQuery = window.location.href.split('=')[1]

$.get('./app.json', json => {

    if(urlQuery == 'bestplayed') urlQuery = json.library.best_played.title
    if(urlQuery == 'lastplayed') urlQuery = json.library.last_played.title
    
    $('#level-name').text(urlQuery)
    $('#level-detail').css('background-image', `url(../private/images/levels/${urlQuery}.jpg)`)
    $('#level-detail').css('background-size', 'cover')
    $('<a>',{
        text: `Play at ${urlQuery}`,
        class: 'level-play',
        href: `/private/game/index.html?${urlQuery}`,
    }).appendTo('#level-detail');

    $(document).prop('title', `Play @ ${urlQuery} | ATC`)
})