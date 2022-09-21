
$.get('../settings.json', function(data) {
    let settings = JSON.parse(data)

    document.getElementById('version').textContent = 'Version ' + settings.about.version
    document.getElementById('author').textContent = 'By ' + settings.about.author
}, 'text');