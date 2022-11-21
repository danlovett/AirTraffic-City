let message
try {
    message = window.location.href.split('?')[1]
} catch(err) {
    throw err
}

// DEV ONLY reset DB results from server.js route
if(message != undefined) $('<p>', {
    text: 'Operation successful by admin. See console.',
    class: 'text-center color-green m10 fs15',
    id: 'message'
}).prependTo('#library')

setTimeout(() => {
    $("#message").remove()
}, 1500);

$.get('../../db/leaderboard.json', data => {
    console.log(data)
})

// read from .json file
$.get('../../app.json', function(data) {
    // set the whole file to variable
    let lib = JSON.parse(data)

    const data_titles = [lib.library.best_played.title, lib.library.last_played.title]
    const data_images = [lib.library.best_played.image, lib.library.last_played.image]

    $('<div>', {
        id: 'quick-play-desc',
    }).prependTo('#quick-play-ui')


    for(let data = 0; data < 2; data++) {
        $('<p>', {
            class: 'text-center fs20',
            text: `${data == 0 ? 'Best Played' : 'Last Played'}`
        }).appendTo('#quick-play-desc')
    }

    $('<h1>', {
        class: 'fs30 text-center m20',
        text: 'Quick Play'
    }).prependTo('#quick-play-ui')

    for(let data = 0; data < data_titles.length; data++) {
        // console.log(`Title #${data}: ${data_titles[data]}\nImage #${data}: ${data_images[data]}`)
        if(data_titles[data] != "") {
            $('<a>',{
                id: `quick-play-${data_titles[data]}`,
                class: 'quick-play-child',
                href: `/level?${CryptoJS.AES.encrypt(data_titles[data], "level")}&${CryptoJS.AES.encrypt(String(data), "status-message")}`,
            }).appendTo('#quick-play'); // add it to the levels id (over iterations levels will populate into list)
            // create new element to display title declaring text and class
            $('<h2>',{
                text: data_titles[data]
            }).appendTo(`#quick-play-${data_titles[data]}`)
    
            // set background image to level (unique for each)
            $(`#quick-play-${data_titles[data]}`).css('background-image', `url(${data_images[data]}`)
        }
    }


    // populating the Library of levels
    // initiate loop for how many levels there are, using length of array in .json file
    for(let i = 0; i< lib.library.levels.titles.length; i++) {
        // create new clickable element and declare id, class and href
        $('<a>',{
            id: `${lib.library.levels.titles[i]}`,
            class: 'child',
            href: `/level?${CryptoJS.AES.encrypt(lib.library.levels.titles[i], "level")}&${CryptoJS.AES.encrypt("2", "status-message")}`,
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