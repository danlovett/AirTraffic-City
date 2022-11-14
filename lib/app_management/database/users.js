// USER CONFIG of database
// GET LOGIN DETAILS by parsing in functions
// SET UP NEW USERS by parsing data in function as args
// FUTURE: delete users
"use strict"

let sql;

// set up the module and assign to const
const sqlite3 = require('sqlite3').verbose();

// get the right database
const db = new sqlite3.Database('../../config/user/data.db', sqlite3.OPEN_READWRITE, err => {
  if(err) throw err;
});

function appendUser(first_name, last_name, username, email, password) {
  sql = `INSERT INTO users(username, first_name, last_name, email_address, password, pfp, skill_level, last_played, best_played) VALUES("${username}", "${first_name}", "${last_name}", "${email}", "${password}", "undefined", 0, "undefined", "undefined")`;
  handleSQL(sql)
}

function findUser(username, password) {
  sql = `SELECT * FROM users WHERE useranme = ${username} AND password = ${password};`;
  handleSQL(sql)
}

function handleSQL(sql) {
  // do this to all the database -> parses sql query, error, and rows to use
  db.all(sql, [], (err, rows) => {
    // error? throw it mate
    if(err) throw err;

    rows.forEach(row => {
      // log it mannn -> DEV ONLY for now
      console.log(row)
    })
  })
}
