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
            text: index.library.levels.titles[i],
            class: "background-filter",
        }).appendTo(`#child${i}`)

        document.getElementById(`child${i}`).style.backgroundImage = index.library.levels.images[i]
        
    }
}, 'text');

document.getElementById('nav-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard').style.display = 'block'
    document.getElementById('library').style.filter = 'blur(8px)'
    document.getElementById('library').style.pointerEvents = 'none'
    document.getElementById('links').style.display = 'none'
    document.getElementById('user').style.display = 'flex'

})

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('user').style.display = 'none'
    document.getElementById('links').style.display = 'flex'
    document.getElementById('library').style.pointerEvents = 'all'
    document.getElementById('library').style.filter = 'blur(0px)'
    document.getElementById('leaderboard').style.display = 'none'
})

document.getElementById('nav-history').addEventListener('click', () => {
    document.getElementById('history').style.display = 'block'
    document.getElementById('library').style.filter = 'blur(8px)'
    document.getElementById('library').style.pointerEvents = 'none'
    document.getElementById('links').style.display = 'none'
    document.getElementById('user').style.display = 'flex'

})

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('user').style.display = 'none'
    document.getElementById('links').style.display = 'flex'
    document.getElementById('library').style.pointerEvents = 'all'
    document.getElementById('library').style.filter = 'blur(0px)'
    document.getElementById('history').style.display = 'none'
})