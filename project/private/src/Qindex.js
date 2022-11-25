
$.get('./db/contentController.json', function(data) {
    let index = JSON.parse(data)

    $('#version').html(`Version ${index.version}`)
    $('#author').html(`By ${index.author}`)
}, 'text');