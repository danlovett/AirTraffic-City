let libraryLocation = '../../lib/raw/app.json'


function checkAuth() {
    // set default
    $('#links').css('display', 'flex')
    // retrieve the JSON file and attach the data variable in a callback function
    $.get(`${libraryLocation}`, function(data) {

        // auth true?
        if(data.temp.auth == true) {
            $('#auth').css('display', 'flex')
        // auth false
        } else {
            $('#auth').css('display', 'none')
            $('#no-auth').css('display', 'flex')
        }
    })
}

function changeLogin() {
    $('#signup-form').css('display', 'none')
    $('#signup-title').css('display', 'none')
    $('#login-form').css('display', 'grid')
    $('#login-title').css('display', 'flex')

}

function changeSignup() {
    $('#signup-form').css('display', 'grid')
    $('#signup-title').css('display', 'flex')
    $('#login-form').css('display', 'none')
    $('#login-title').css('display', 'none')
}

// declare function with 3 params
// id being fetched, what type of display (flex, block, grid, none), userNavDetail (all authed links or not)
function openThis(place, displayType, userNavDetail) {
    // add blur to state importance of layers
    $('#library').css('filter', 'blur(8px)')
    // disable clickable actions on library layer
    $('#library').css('pointerEvents', 'none')
    // show the section which was requested by user
    $(`#${place}`).css('display', `${displayType}`)
    // show either detailed or simple nav
    userNavDetail == true ? $('#links').css('display', 'none') : $('#user').css('display', 'flex')
}

// declare function with 1 param
// id being fetched
function closeThis(place) {
    //hide selected section
    $(`#${place}`).css('display', 'none')
    // concentrate focus on unblured section
    $('#library').css('filter', 'blur(0px')
    // allow clicks on this section
    $('#library').css('pointerEvents', 'all')
    // show nav detail, based on auth status
    checkAuth()
}

// find the name of the level
function openLevelDetail(number) {
    // read from JSON file using jQuery
    $.get(libraryLocation, function(data) {
        // assign the title to the html id tag
        $('#level-name').text(data.library.levels.titles[number])
    })
}

// displau and populate the level information pane
function loadLevelPane(level) {
    // hide library section and show the level information pane
    $('#library').css('filter', 'blur(8px')
    $('#library').css('pointerEvents', 'none')
    $('#level-detail').css('display', 'block')
    $('#level-name').text(level)

    $('#level-detail').css('background-image', `url(../lib/src/levels/${level}.jpg)`)
    $('#level-detail').css('background-size', 'cover')

    // add code to extract information on level and display instructions and
    //   provide which .js file to run for the unique level (to implement)
}

// processing the home.html page on load
// TO DO: set default values in home.html when the webpage has not yet loaded jQuery data


// read from .json file
$.get(libraryLocation, function(data) {
    // set the whole file to variable
    let lib = JSON.parse(data)

    // run function to populate navbar depending on auth status
    checkAuth()


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



    // populating the Library of levels
    // initiate loop for how many levels there are, using length of array in .json file
    for(let i = 0; i< lib.library.levels.titles.length; i++) {
        // create new clickable element and declare id, class and href
        $('<a>',{
            id: `${lib.library.levels.titles[i]}`,
            class: 'child',
            href: '#',
        }).appendTo('#levels'); // add it to the levels id (over iterations levels will populate into list)
        // create new element to display title declaring text and class
        $('<h2>',{
            text: lib.library.levels.titles[i],
            class: "background-filter",
        }).appendTo(`#${lib.library.levels.titles[i]}`)

        // set background image to level (unique for each)
        $(`#${lib.library.levels.titles[i]}`).css('background-image', `url(${lib.library.levels.src[i]}`)

        // do something when <a> is clicked, extracting unique id
        $(`#${lib.library.levels.titles[i]}`).bind('click', () => { 
            loadLevelPane(lib.library.levels.titles[i]) // function to load level information
        })
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