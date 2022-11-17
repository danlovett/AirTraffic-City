
function getEntries() {
    let type = window.location.href.split('=')[1]
    $.get(`./db/${type}.json`, json => {
        const entries = json.entries
        //leaderboard stuff
        const id_types = ['name', 'date', 'score', 'errors', 'level']
        
        
        $('<table>', {
            id: `${type}-entries`
        }).appendTo(`#${type}`)
        
        $('<tr>', {
            class: "color-black fs20 m20",
            id: 'table-header'
        }).appendTo(`#${type}-entries`)
        
        for(let i = 0; i < id_types.length; i++) {
            $('<th>', {
                text: `${id_types[i].charAt(0).toUpperCase() + id_types[i].slice(1)}`,
                class: "color-black fs20 m20"
            }).appendTo('#table-header')
        }
        
        for(let x = 0; x < entries.length; x++) {
            $('<tr>',{
                id: `entry${x + 1}`,
            }).appendTo(`#${type}-entries`)
            let obj = Object.values(entries[x])
            for(let value of obj) {
                    $('<th>',{
                        class: "color-black fs20 m20",
                        id: id_types[x],
                        text: value,
                        href: `remove?id=${x}`
                    }).appendTo(`#entry${x + 1}`)
            }
        }
        
        type = type.charAt(0).toUpperCase() + type.slice(1)
        $(document).prop('title', `${type} | ATC`)
        $('#header').text(type)
    })
}