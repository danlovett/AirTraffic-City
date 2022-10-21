
$.get('../../lib/raw/app.json', function(data) {
    let index = JSON.parse(data)

    $('#version').html(`${index.about.version}`)
    $('#author').html(`${index.about.author}`)
}, 'text');