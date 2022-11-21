// create function to run on document load (<body onload="getEntries()">)
// THis function will be made to support both leaderboard and history
// ... sections of project
function getEntries() {
    // what board is being used (extracted using Express(req.query.{queryItem}))
    let type = window.location.href.split('=')[1]

    // create the section
    $('<section>', {
        id: `${type}`, // set what sort of board it is (for css and jQuery usage)
        class: 'board p20' // add framework css for visuals
    }).appendTo('body') // append to the main tag of page

    // make the header (dynamic)
    $('<h1>', {
        id: 'header', 
        class: 'fs30' // adding framework
    }).appendTo(`#${type}`) // add to previously created section from id

    // make seperator - visuals are compiled by css
    $('<div>', {class:'sep'}).appendTo(`#${type}`)

    // read the file using jQuery and JSON
    $.get(`./db/${type}.json`, json => {
        const entries = json.entries // set up what part of JSON to use
        //table in board headers
        const id_types = ['name', 'date', 'score', 'errors', 'level']
        
        // are there entries from JSON file?
        if(entries.length > 0) {
            // create table
            $('<table>', {
                // ensuring the correct table will be used
                // ... when adding other values
                id: `${type}-entries`
            }).appendTo(`#${type}`)
            
            // new table row
            $('<tr>', {
                class: "fs20 m20", // framework
                id: 'table-header'
            }).appendTo(`#${type}-entries`) // add to correct table
            
            // add the headers of the table to table
            for(let i = 0; i < id_types.length; i++) {
                $('<th>', { // new row entry
                    // making text capitalised using character seperation
                    text: `${id_types[i].charAt(0).toUpperCase() + id_types[i].slice(1)}`,
                    class: "fs20 m20"
                }).appendTo('#table-header') // add it to the table heading
            }
            // adding table entries from JSON file
            for(let x = 0; x < entries.length; x++) {
                // same process as before, add new row 
                $('<tr>',{
                    id: `entry${x + 1}`, // this time assign row id
                }).appendTo(`#${type}-entries`)

                let obj = Object.values(entries[x]) // convert text to object

                for(let value = 0; value < obj.length; value++) { // cycle through each key in object and get val
                    console.log(value)
                    $('<th>',{ // new row part
                        class: "color-black fs20 m20",
                        id: `${id_types[value]}-${x + 1}`, // for future updates (TABLE FILTERS)
                    }).appendTo(`#entry${x + 1}`) // x is 0 based, add 1
                    if(id_types[value] == 'name' || id_types[value] == 'level') {
                        $('<a>', {
                            text: obj[value],
                            href: `${window.location.origin}/${id_types[value]}?id=${obj[value]}`
                        }).appendTo(`#${id_types[value]}-${x + 1}`)
                    } else {
                        // console.log(`${id_types[value]}-${x + 1}`)
                        $(`#${id_types[value]}-${x + 1}`).text(obj[value]).css('color', 'white')
                    }
                }
            }
        } else { // there are no entries in the leaderboard table in database?
            $('<p>', { // new paragraph
                text: 'Nothing to see here :(', // User feedback
                class: 'text-center fs20 m20'
            }).appendTo(`#${type}`) // add to correct board
        }
        
        // Set title to correct board type using Express({res.query.dest})
        type = type.charAt(0).toUpperCase() + type.slice(1)
        $(document).prop('title', `${type} | ATC`)
        $('#header').text(type)
    })
}