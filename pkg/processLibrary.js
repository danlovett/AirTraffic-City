function checkAuth() {
    $('#links').css('display', 'flex')
    $.get('../pkg/JSON/info.json', function(data) {

        if(data.temp.auth == true) {
            $('#auth').css('display', 'flex')
        } else {
            $('#auth').css('display', 'none')
            $('#no-auth').css('display', 'flex')
        }
    })
}

function changeLogin() {
    $('#signup-form').css('display', 'none')
    $('#login-form').css('display', 'grid')
}

function changeSignup() {
    $('#signup-form').css('display', 'grid')
    $('#login-form').css('display', 'none')
}

function openThis(place, displayType, userNavDetail) {
    $('#library').css('filter', 'blur(8px)')
    $('#library').css('pointerEvents', 'none')
    $(`#${place}`).css('display', `${displayType}`)
    userNavDetail == true ? $('#links').css('display', 'none') : $('#user').css('display', 'flex')
}

function openLevelDetail(number) {
    $.get('../pkg/JSON/info.json', function(data) {
        $('#level-name').text(data.library.levels.titles[number])
    })
}

function closeThis(place) {
    $(`#${place}`).css('display', 'none')
    $('#library').css('filter', 'blur(0px')
    $('#library').css('pointerEvents', 'all')
    checkAuth()
}

function loadLevelPane(level) {
        $('#library').css('filter', 'blur(8px')
        $('#library').css('pointerEvents', 'none')
        $('#level-detail').css('display', 'block')
        $('#level-name').text(level)

        $('#level-detail').css('background-image', `url(../images/levels/${level}.jpg)`)
        $('#level-detail').css('background-size', 'cover')
}

$.get('../pkg/JSON/info.json', function(data) {
    let lib = JSON.parse(data)

    checkAuth()

    $('#best-played').css('background-image', `url(${lib.library.best_played.image}`)
    $('#best-played-title').text(`${lib.library.best_played.title}`)

    $('#last-played').css('background-image', `url(${lib.library.last_played.image}`)
    $('#last-played-title').text(`${lib.library.last_played.title}`)

    for(let i = 0; i< lib.library.levels.titles.length; i++) {
        $('<a>',{
            id: `${lib.library.levels.titles[i]}`,
            class: 'child',
            href: '#',
        }).appendTo('#levels');
        $('<h2>',{
            text: lib.library.levels.titles[i],
            class: "background-filter",
        }).appendTo(`#${lib.library.levels.titles[i]}`)

        $(`#${lib.library.levels.titles[i]}`).css('background-image', `url(${lib.library.levels.images[i]}`)


        $(`#${lib.library.levels.titles[i]}`).bind('click', () => { 
            loadLevelPane(lib.library.levels.titles[i])
        })
    }

    $('#best-played').bind('click', () => {
        loadLevelPane($('#best-played-title').text())
    })
    $('#last-played').bind('click', () => {
        loadLevelPane($('#last-played-title').text())
    })

}, 'text');