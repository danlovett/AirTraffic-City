
// read from .json file
$.get('../../app.json', function(data) {
    // set the whole file to variable
    let lib = JSON.parse(data)

    if(lib.library.best_played.title != "") {
        // populate background image and title for best-played level
        $('#best-played').css('background-image', `url(${lib.library.best_played.image}`)
        $('#best-played-title').text(`${lib.library.best_played.title}`)
    } else {

    }

    if(lib.library.last_played.title != "") {
        // populate background image and title for last-played level
        $('#last-played').css('background-image', `url(${lib.library.last_played.image}`)
        $('#last-played-title').text(`${lib.library.last_played.title}`)
    } else {

    }
    
    $('#link-best-played').attr('href', `/level?id=${lib.library.best_played.title}`)
    $('#link-last-played').attr('href', `/level?id=${lib.library.last_played.title}`)



    // populating the Library of levels
    // initiate loop for how many levels there are, using length of array in .json file
    for(let i = 0; i< lib.library.levels.titles.length; i++) {
        // create new clickable element and declare id, class and href
        $('<a>',{
            id: `${lib.library.levels.titles[i]}`,
            class: 'child',
            href: `/level?id=${lib.library.levels.titles[i]}`,
        }).appendTo('#levels'); // add it to the levels id (over iterations levels will populate into list)
        // create new element to display title declaring text and class
        $('<h2>',{
            text: lib.library.levels.titles[i],
            class: "background-filter",
        }).appendTo(`#${lib.library.levels.titles[i]}`)

        // set background image to level (unique for each)
        $(`#${lib.library.levels.titles[i]}`).css('background-image', `url(${lib.library.levels.src[i]}`)

        // // do something when <a> is clicked, extracting unique id
        // $(`#${lib.library.levels.titles[i]}`).bind('click', () => { 
        //     console.log(i)
        // })
    }

    // do something when the best-played <div> is clicked
    $('#best-played').bind('click', () => {
        loadLevelPane($('#best-played-title').text())
    })
    // do something when the last-played <div> is clicked
    $('#last-played').bind('click', () => {
        loadLevelPane($('#last-played-title').text())
    })
}, 'text'); // setting the reading type to text

$('#link-library').bind('click', () => {
    $('#link-quick-play').css('background-color', 'black')

    $('#link-quick-play').css('color', 'white')
    $('#quick-play-ui').css('display', 'none')

    $('#link-library').css('background-color', 'white')
    $('#link-library').css('color', 'black')
    $('#lib-ui').css('display', 'block')

    $(document).prop('title', `Library | ATC`)
})

$('#link-quick-play').bind('click', () => {
    $('#link-quick-play').css('background-color', 'white')
    $('#link-quick-play').css('color', 'black')
    $('#quick-play-ui').css('display', 'block')

    $('#link-library').css('background-color', 'black')
    $('#link-library').css('color', 'white')

    $('#lib-ui').css('display', 'none')

    $(document).prop('title', `Quick Play | ATC`)
})