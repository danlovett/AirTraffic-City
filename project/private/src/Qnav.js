$.get('../../app.json', function(data) {

    let lib = JSON.parse(data)

    if(lib.temp.auth == true) {
        $('#auth').css('display', 'flex')
        $('#no-auth').css('display', 'none')
    }

    if(lib.temp.auth == false) {
        $('#auth').css('display', 'none')
        $('#no-auth').css('display', 'flex')
    }

}, 'text')

$.get('../../db/currentUser.json', data => {
    $('#pfp').attr('src', `${data.pfp}`)
})