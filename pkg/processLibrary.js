$.get('../pkg/JSON/info.json', function(data) {
    let index = JSON.parse(data)

    document.getElementById('best-played').style.backgroundImage = index.library.best_played.image
    document.getElementById('best-played-desc').textContent = index.library.best_played.desc

    document.getElementById('last-played').style.backgroundImage = index.library.last_played.image
    document.getElementById('last-played-desc').textContent = index.library.last_played.desc

    for(let i = 0; i< index.library.levels.titles.length; i++) {
        $('<a>',{
            id: `child${i}`,
            class: 'child',
            href: '#',
        }).appendTo('#levels');
        $('<h2>',{
            text: index.library.levels.titles[i]
        }).appendTo(`#child${i}`)

        document.getElementById(`child${i}`).style.backgroundImage = index.library.levels.images[i]
    }
}, 'text');