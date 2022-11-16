function getEntries() {
    let type = window.location.href.split('=')[1]
    $.get(`./db/${type}.json`, json => {
        const data = json.data
        //leaderboard stuff
        const id_types = ['name', 'date', 'score', 'errors']
        
        
        $('<table>', {
            id: `${type}-entries`
        }).appendTo(`#${type}`)
        
        $('<tr>', {
            class: "color-black fs20 m20",
            id: 'table-header'
        }).appendTo(`#${type}-entries`)
        
        for(let i = 0; i < id_types.length; i++) {
            $('<th>', {
                text: `${id_types[i]}`,
                class: "color-black fs20 m20"
            }).appendTo('#table-header')
        }
        
        for(let x = 0; x < data.length; x++) {
            $('<tr>',{
                id: `entry${x + 1}`,
                href: '#'
            }).appendTo(`#${type}-entries`)
            for(let i = 0; i < data[x].length; i++) {
                $('<th>',{
                    class: "color-black fs20 m20",
                    id: id_types[i],
                    text: data[x][i]
                }).appendTo(`#entry${x + 1}`)
            }
        }
        
        type = type.charAt(0).toUpperCase() + type.slice(1)
        $(document).prop('title', `${type} | ATC`)
        $('#header').text(type)
    })
}