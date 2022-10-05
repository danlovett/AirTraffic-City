
$.get('../pkg/JSON/library.json', function(data) {
    let index = JSON.parse(data)

    document.getElementById('version').textContent = index.about.version
    document.getElementById('author').textContent = index.about.author
}, 'text');