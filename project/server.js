const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs'); 
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require('jquery')(window)

const app = express();
app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/library', (req, res) => {
    res.sendFile(__dirname + '/private/library.html')
})

app.get('/auth/login', (req, res) => {
    res.sendFile(__dirname + '/private/auth/login.html')
})

app.get('/auth/signup', (req, res) => {
    res.sendFile(__dirname + '/private/auth/signup.html')
})

app.get('/board', (req, res) => {
    console.log(req.originalUrl)
    getBoard(req.query.dest)
    res.sendFile(__dirname + '/private/board.html')
})

app.get('/board/data:name:date:score:errors', (req, res) => {
    // appendData(`{name:${req.params.name}, date:${req.params.date}, score:${req.params.score}, errors:${req.params.errors}}`)
    res.sendFile(__dirname + '/private/board.html')
})  

app.get('/level', (req, res) => {
    res.sendFile(__dirname + '/private/level.html')
    URLquery = req.query.id
})

app.get('/?404', (req, res) => {
    res.sendFile(__dirname + '/private/errorDoc.html')
})

app.listen(4000);

function getBoard(dest) {
    // declare array to push entries of each queried row using sqlite3
    let sql;
    // set up the module and assign to const
    
    // get the right database
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
      if(err) throw err;
    //   sql = 'INSERT INTO "leaderboard" (name, score, errors) VALUES("John Doe", 700, 3);'
      sql = `SELECT * FROM "${dest}"`
      
      db.all(sql, [], (err, rows) => {
        // error? throw it mate
        if(err) {
            console.log(err)
            return false
        } 
        let entries = []
        rows.forEach(row => {
            entries.push({name: row["name"], date: row["date"], score: row["score"], errors: row["errors"], level: "INOP"})
        })

        // sort based on score and error ratio
        entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));

        console.log(entries)

        fs.writeFile(`./db/${dest}.json`, `{"entries": ${JSON.stringify(entries)}}`, (err, result) => {
            if(err) throw err
        })
      })
    });
  
}

function appendData(data) {
  fs.appendFile('./leaderboard.json', String(data), function (err) {
    if (err) throw err;
    console.log(`The server (ATC) succesfully added this data:\n${data}`);
  });
}