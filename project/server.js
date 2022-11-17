const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs'); 

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
    getBoard(req.query.dest)
    res.sendFile(__dirname + '/private/board.html')
})

app.get('/results', (req, res) => {
    let resSQL = `INSERT INTO "leaderboard" (name, date, score, errors) VALUES("${req.query.name}", DATE('now'), ${req.query.score}, ${req.query.errors});`
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        if(err) throw err;
        db.all(resSQL, [], err => { // if not work add rows back to args in arrow func
            // error? throw it mate
            if(err) throw err // deal with this later where there may be another entry under same name
        })
    })
    res.redirect(302, `/board?dest=leaderboard`)
})  

app.get('/level', (req, res) => {
    res.sendFile(__dirname + '/private/level.html')
})

app.get('/?404', (req, res) => {
    res.sendFile(__dirname + '/private/errorDoc.html')
})

app.get('/gameEnded', (req, res) => {
    res.sendFile(__dirname + '/game/endgame.html')
})

app.listen(4000);

function getBoard(dest) {
    // declare array to push entries of each queried row using sqlite3
    let sql;
    
    // get the right database
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
      if(err) throw err;
    //   sql = 'INSERT INTO "leaderboard" (name, score, errors) VALUES("John Doe", 700, 3);'
      sql = `SELECT * FROM ${dest};`
      
      db.all(sql, [], (err, rows) => {
        // error? throw it mate
        if(err) {
            throw err
        } 
        let entries = []
        rows.forEach(row => {
            entries.push({name: row["name"], date: row["date"], score: row["score"], errors: row["errors"], level: "INOP"})
        })

        // sort based on score and error ratio
        entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));

        fs.writeFile(`./db/${dest}.json`, `{"entries": ${JSON.stringify(entries)}}`, (err, result) => {
            if(err) throw err
        })
      })
    });
  
}